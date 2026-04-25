@echo off
:: Batch file to convert all images in a folder to WebP format using FFmpeg
:: Usage: Place this .bat file in a folder with images and run it

echo Converting images to WebP format...
for %%i in (*.jpg *.jpeg *.png *.bmp *.tiff *.gif) do (
    ffmpeg -i "%%i" -q:v 80 "%%~ni.webp"
)
echo Conversion completed!
pause
