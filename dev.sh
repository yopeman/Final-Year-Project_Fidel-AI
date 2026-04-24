#!/bin/bash

(ngrok http 8000 > /dev/null 2>&1) &
(cd backend-api && ./main.py) &
(cd frontend-web && npm run dev) &
(cd mobile-app && npx expo start) &
wait
