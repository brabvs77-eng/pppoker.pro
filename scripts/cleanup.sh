#!/bin/bash
cd /vercel/share/v0-project

echo "Starting cleanup..."
echo ""

# Remove vendor folder
if [ -d "./assets/vendor" ]; then
  echo "Removing ./assets/vendor (175MB)..."
  find ./assets/vendor -type f -delete
  find ./assets/vendor -type d -delete
  echo "Done!"
fi

# Remove backup folder
if [ -d "./assets/media/backup" ]; then
  echo "Removing ./assets/media/backup (5.4MB)..."
  find ./assets/media/backup -type f -delete
  find ./assets/media/backup -type d -delete
  echo "Done!"
fi

echo ""
echo "Current project size:"
du -sh .

echo ""
echo "Verification:"
echo "Vendor exists: $([ -d ./assets/vendor ] && echo 'YES' || echo 'NO')"
echo "Backup exists: $([ -d ./assets/media/backup ] && echo 'YES' || echo 'NO')"
