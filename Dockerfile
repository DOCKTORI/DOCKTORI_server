# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install -g npm@latest

# Copy the rest of the application code to the working directory
COPY . .

# Make port 9999 available to the world outside this container
EXPOSE 8888

# Define environment variable
ENV NODE_ENV=production

# Run the application when the container launches
CMD ["node", "app.js"]