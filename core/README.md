# FlawIS-users
Microservice handling users of FlawIS implemented as a GraphhQL API with mongoDB as data layer..

## Reach 360 integration

Configure the core service with:

```env
REACH_API_BASE_URL=https://api.reach360.eu
REACH_API_KEY=
REACH_WEBHOOK_SECRET=
```

Use `https://api.reach360.com` for a US Reach tenant. Generate the API key in
Reach under **Manage → Settings → Manage API Keys**.

Create a Reach webhook for the `user.created` event whose target is:

```text
https://<core-host>/integrations/reach/webhooks
```

Set its `sharedSecret` to the same value as `REACH_WEBHOOK_SECRET`. Course
configuration requires the published Reach course ID and the learner-facing
direct link copied from the Reach **Learn** tab.
