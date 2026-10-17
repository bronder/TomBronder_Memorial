#!/bin/bash
cd "$(dirname "$0")"
echo "Memorial montage: http://localhost:8000"
exec python3 -m http.server 8000
