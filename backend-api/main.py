#!/home/yope/.projects/code/Final-Year-Project_Fidel-AI/backend-api/.venv/bin/python

import uvicorn

if __name__ == "__main__":    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
