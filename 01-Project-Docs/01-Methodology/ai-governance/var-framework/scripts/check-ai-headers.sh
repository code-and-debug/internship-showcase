#!/bin/bash
# 检查AI生成代码的元数据头部

echo "Checking AI code headers..."

files=$(git diff --cached --name-only --diff-filter=A | grep -E '\.(ts|tsx|js|jsx)$' || true)

exit_code=0
for file in $files; do
  if [[ "$file" == *"human-only"* ]] || [[ "$file" == *".spec."* ]]; then
    continue
  fi
  
  if grep -q "@generator AI" "$file" 2>/dev/null; then
    echo "  Checking $file..."
    
    for tag in "@generator" "@prompt-hash" "@confidence"; do
      if ! grep -q "$tag" "$file" 2>/dev/null; then
        echo "    ❌ Missing $tag"
        exit_code=1
      fi
    done
  fi
done

if [ $exit_code -eq 0 ]; then
  echo "✅ All AI code headers valid"
else
  echo "❌ Some AI code headers are incomplete"
fi

exit $exit_code
