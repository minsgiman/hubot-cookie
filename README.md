# Hubot Cookie! 🍪

# Getting start

## install

```bash
$ yarn install
```

## Start your first hubot

### Put your hubot token

#### Using .env.local

```bash
# create .env.local

HUBOT_SLACK_TOKEN=xoxb-xxxx-xxx-xxxxx
```

#### Using environments directly

```bash
$ HUBOT_SLACK_TOKEN=xoxb-xxxx-xxx-xxxxx yarn start

or

$ export HUBOT_SLACK_TOKEN=xoxb-xxxx-xxx-xxxxx
$ yarn start
```

#### Using dev mode

```
yarn start:dev
```

## Confirm no bootstrap issue

#### Make sure all processes are running

```
# after yarn start
$ ps -ef | grep hubot
```

#### confirm bootstrap success log

```
$ tail -f logs/yyyy-mm-dd.log
```

## How to Stop

#### stop processes and confirm

```
$ yarn stop

# check all processes stop
$ ps -ef | grep hubot
```

## Monitor

#### Monitor pm2 process (not shown master process)

```
$ yarn run monit
```

#### Monitor logs

```
$ tail -f logs/yyyy-mm-dd.log
```
