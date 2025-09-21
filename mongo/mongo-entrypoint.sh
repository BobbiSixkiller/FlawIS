#!/bin/bash
set -e

# Start mongod in background
mongod --bind_ip_all --replSet rs0 &
pid="$!"

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
until mongosh --host localhost:27017 --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 2
done

# Check replica set status
echo "Checking replica set status..."
mongosh --host localhost:27017 <<EOF
try {
  rs.status();
} catch (e) {
  if (e.codeName === 'NotYetInitialized') {
    rs.initiate({
      _id: 'rs0',
      members: [{ _id: 0, host: 'mongo:27017' }]
    });
  }
}
EOF

# Wait on mongod process
wait $pid
