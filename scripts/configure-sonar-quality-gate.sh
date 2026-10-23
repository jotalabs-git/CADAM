#!/usr/bin/env bash
set -euo pipefail

: "${SONAR_HOST_URL:?Set SONAR_HOST_URL (e.g. http://localhost:9000)}"
: "${SONAR_TOKEN:?Set SONAR_TOKEN with Quality Gate administration permission}"

host="${SONAR_HOST_URL%/}"
gate="CADAM - Strict New Code"
project="jotalabs-cadam"

api() {
  local endpoint="$1"
  shift
  curl --fail --silent --show-error --user "${SONAR_TOKEN}:" --request POST "${host}/api/${endpoint}" "$@"
}

echo "Creating CADAM-specific Quality Gate if absent..."
if ! curl --fail --silent --show-error --user "${SONAR_TOKEN}:" \
  "${host}/api/qualitygates/list" | grep -Fq "\"name\":\"${gate}\""; then
  api qualitygates/create --data-urlencode "name=${gate}" >/dev/null
fi

# Remove any existing conditions so this script is idempotent even if rules change.
conditions="$(curl --fail --silent --show-error --user "${SONAR_TOKEN}:" \
  --get "${host}/api/qualitygates/show" --data-urlencode "name=${gate}")"
# We intentionally avoid deleting user-modified conditions automatically.
# If conditions already exist, inspect them before running this script again.
if printf '%s' "$conditions" | grep -Eq '"conditions":\\[[^]]+\\]'; then
  echo "Quality Gate already contains conditions. Review and update in SonarQube UI:"
  echo "${host}/quality_gates"
  exit 1
fi

add_condition() {
  api qualitygates/create_condition \
    --data-urlencode "gateName=${gate}" \
    --data-urlencode "metric=$1" \
    --data-urlencode "op=$2" \
    --data-urlencode "error=$3" >/dev/null
}

add_condition new_violations GT 0
add_condition new_security_rating GT 1
add_condition new_reliability_rating GT 1
add_condition new_maintainability_rating GT 1
add_condition new_coverage LT 80
add_condition new_duplicated_lines_density GT 1

api qualitygates/select --data-urlencode "projectKey=${project}" \
  --data-urlencode "gateName=${gate}" >/dev/null

echo "Applied Quality Gate to ${project}: no new issues, ratings A, coverage >=80%, duplication <=1%."
echo "Define the New Code baseline in SonarQube project settings before relying on these conditions."
