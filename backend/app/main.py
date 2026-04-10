from fastapi import FastAPI


app = FastAPI(title="Iron Fit API")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Iron Fit backend is running"}
