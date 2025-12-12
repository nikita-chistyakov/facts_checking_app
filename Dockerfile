# Use a lean Nginx base image
FROM nginx:alpine

# Copy the custom Nginx configuration file
# This is crucial for Cloud Run to listen on the required port (8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove the default Nginx HTML content
RUN rm -rf /usr/share/nginx/html/*

# Copy your application files (including index.html) into the Nginx public folder
# The period '.' copies everything in the repo root to the container's serve directory
COPY . /usr/share/nginx/html

# Nginx listens on port 80 by default, but we configured it to listen on 8080 in nginx.conf
EXPOSE 8080

# The Nginx server runs as the main process
CMD ["nginx", "-g", "daemon off;"]
