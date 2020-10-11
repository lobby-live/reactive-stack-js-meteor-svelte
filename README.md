# Reactive Stack JS with [meteor](https://www.meteor.com/) and [svelte](https://svelte.dev/)

See [reactive-stack](https://github.com/cope/reactive-stack) for more info.

## Requirements

*   Meteor ([_install_](https://www.meteor.com/install))
*   MongoDB ([_install_](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials))
    *   **IMPORTANT**: as a cluster (_see_ [_MongoDB: Convert a Standalone to a Replica Set_](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/))
    *   with featureCompatibilityVersion = "3.6" (_see_ [_setFeatureCompatibilityVersion_](https://docs.mongodb.com/manual/reference/command/setFeatureCompatibilityVersion/))
*   [Yarn](https://yarnpkg.com/) (_preferred over npm_)
*   System variable `MONGO_URL=mongodb://localhost:27017/reactivestackjs`

## Run

```shellsession
meteor npm install
yarn start
```

## Install

First make sure you have taken care of all the [requirements](https://github.com/reactive-stack-js/reactive-stack-js-meteor-svelte/blob/main/README.md#requirements).

### Configure Login

When you first start either react or svelte meteor applications, you need to configure the login.

Click **Sign in**:

![alt text](https://raw.githubusercontent.com/reactive-stack-js/reactive-stack-js/main/images/meteor/meteor01.png)

Configure the logins by adding respective app ids and secrets:

![alt text](https://raw.githubusercontent.com/reactive-stack-js/reactive-stack-js/main/images/meteor/meteor02.png)

In the end, you will see the `meteor_accounts_loginServiceConfiguration` collection and in it your configuration:

![alt text](https://raw.githubusercontent.com/reactive-stack-js/reactive-stack-js/main/images/meteor/meteor03.png)
