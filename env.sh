#!/bin/sh

# Create env-config.js with the environment variable
echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  GEMINI_API_KEY: \"$GEMINI_API_KEY\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js
