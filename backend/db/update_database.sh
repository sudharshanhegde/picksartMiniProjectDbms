#!/bin/bash

# Navigate to the script directory
cd "$(dirname "$0")"

# Run the Python script
echo "Running database schema update script..."
python apply_schema_changes.py

echo "Update complete." 