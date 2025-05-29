echo "=== Stock Video Hub Deployment ==="
echo "Setting up the project..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup admin user
echo "Setting up admin user..."
node utils/seedAdmin.js

# Start the application
echo "Starting the application..."
npm start
