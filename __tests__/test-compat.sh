set -e

echo "running unit tests with Vue $1"
pnpm add -D vue@$1
pnpm test
