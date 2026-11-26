# End-to-end tests of the workshop: docker compose run --rm smoke-test
FROM python:3.13-slim
RUN pip install --no-cache-dir pytest==8.4.2 requests==2.32.5
WORKDIR /tests
COPY test_workshop.py .
ENTRYPOINT ["pytest", "-v", "--tb=short", "test_workshop.py"]
