# OpenFGA CLI with a shell, so the store import can skip a store that already exists.
# The openfga/cli image has only the fga binary.
ARG OPENFGA_CLI_VERSION=v0.9.0
FROM openfga/cli:${OPENFGA_CLI_VERSION} AS cli

FROM alpine:3.22
RUN apk add --no-cache jq
COPY --from=cli /fga /usr/local/bin/fga
COPY import.sh /usr/local/bin/openfga-import
ENTRYPOINT ["/bin/sh", "/usr/local/bin/openfga-import"]
