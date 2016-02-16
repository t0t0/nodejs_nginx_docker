#####################
# NodeJS Dockerfile #
#####################



# Set the base image to Ubuntu
FROM    ubuntu

# File Author / Maintainer
MAINTAINER Toon Lamberigts

# Install Node.js and other dependencies
RUN apt-get update && \
    apt-get -y install nodejs  && \
    apt-get -y install nodejs-legacy && \
    apt-get -y install npm

# Install REDIS
RUN npm install -y redis

# Expose port
EXPOSE  8080

#
# Copy the js file
COPY app.js /src/index.js

# Run the js
CMD ["node", "/src/index.js"]
