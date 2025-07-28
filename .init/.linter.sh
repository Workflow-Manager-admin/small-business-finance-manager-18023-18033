#!/bin/bash
cd /home/kavia/workspace/code-generation/small-business-finance-manager-18023-18033/financial_frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

