// For EC2 PM2 (daemon process manager for Node.js) module
module.exports = {
  apps: [
    {
      name: "orgnocal",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      }
    }
  ]
}