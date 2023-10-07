# Keycloak integration with OpenFGA via Kafka (Legacy)
In this case the integration between [Keycloak](https://www.keycloak.org/) and [OpenFGA](https://openfga.dev/) is via Kafka. This was the first version of the PoC when it wasn't available an OpenFGA SDK for Java for publishing the event directly to OpenFGA - Luckly now there is :).

Therefore If you can follow the new approach with the direct integration between Keycloak and OpenFGA with the new extension describe [here](../README.md)

## Authorization Framework (Legacy)

In this case the following diagram illustrates the solution architecture of this workshop when you use the Kafka integration:

<p align="center">
  <img width="70%" height="70%" src="../doc/images/legacy-solution-architecture.png">
</p>

* Core:

    * Keycloak (A) is responsible for handling the authentication with the standard OpenID Connect and is managing the user access with his Role Model

    * Keycloak is configure with a custom extension (B) [keycloak-openfga-event-listener](https://github.com/embesozzi/keycloak-openfga-event-listener) which listens to the Keycloak events (User Role Assignment, Role to Role Assignment, etc), parses this event into an OpenFGA tuple based on the [Keycloak Authz Schema](openfga/keycloak-authorization-model.json) and publishes the event to Kakfa Cluster (C)

    * Kakfa OpenFGA Consumer (D) that using the OpenFGA SDK will publish the tuples to the OpenFGA Solution

    * OpenFGA (E) is responsible for applying fine-grained access control. The OpenFGA service answers authorization checks by determining whether a relationship exists between an object and a user

* Other components

    * Store Web Application is integrated with Keycloak by OpenID Connect

    * Store API is protected by OAuth 2.0 and it utilizes the OpenFGA SDK for FGA

# How to install?
## Prerequisites

 * Install Git, [Docker](https://www.docker.com/get-docker) and [Docker Compose](https://docs.docker.com/compose/install/#install-compose) in order to run the steps provided in the next section<br>

## Deploy the PoC

1. Clone this repository
    ````bash
    git clone https://github.com/embesozzi/keycloak-openfga-workshop
    cd keycloak-openfga-workshop
    ````

2. Execute following Docker Compose command to start the deployment

   ```sh
   docker-compose -f ./kafka-integration/docker-compose-kafka.yml -f docker-compose-openfga.yml -f ../docker-compose-apps.yml up
   ```

3. To be able to use this environment, you need to add this line to your local HOSTS file:

   ```sh
   127.0.0.1  keycloak openfga store store-api
   ```

4. Access the following web UIs using URLs bellow via a web browser.

    Described [here](../README.md)

## Post configuration steps

### OpenFGA
1. Import the [OpenFGA authorization schema for Keycloak](openfga/keycloak-authorization-model.json):
    ```bash
    cd openfga
    ./import.sh
    ```
2. As the result you will see the following OpenFGA Authorization Model in the [OpenFGA Playground Console](http://localhost:8080/playground) :

    ![openfga-keycloak-authorization-model](../doc/images/openfga-authz-model.png)

### Keycloak
1. Enable the Keycloak OpenFGA Event Listener extension in Keycloak:

    * Open [administration console](http://keycloak:8081)
    * Choose realm
    * Realm settings
    * Select `Events` tab and add `openfga-events-kafka` to Event Listeners.

2. Proceed to initialize the PoC:

    Follow the steps of the README.