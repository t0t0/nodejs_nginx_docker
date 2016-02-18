#####################
# NodeJS Dockerfile #
#####################



# Set the base image to Ubuntu
FROM    ubuntu

# File Author / Maintainer
MAINTAINER Toon Lamberigts

# Install Node.js and npm
RUN apt-get update && \
    apt-get -y install nodejs  && \
    apt-get -y install nodejs-legacy && \
    apt-get -y install npm

# Install app dependencies
RUN npm install -y redis && \
    npm install -y express
COPY Node-test/package.json /src/package.json
run cd /src; npm install

# bundle app source
COPY Node-test/ /src 

# Expose port
EXPOSE  8080

#
# Copy the js file
#COPY Node-test/app.js /src/index.js

# Run the js
CMD ["node", "/src/bin/www"]
