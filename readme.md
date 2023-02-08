# Box
[![NPM](https://img.shields.io/npm/v/channel-box)](https://www.npmjs.com/package/channel-box)

A terminal message passing app powered by [Supabase](https://supabase.com/)

| recommond using node `v16-17`
## Setup
1. clone this repo
2. create a `.env` file in the root project dir (contact me for keys if you want the global database!)
3. `npm i`
4. `npm link`
5. 'run box --help' for a list of commands

## Self Hosted
- create a supabase project with the following tables
    - `channel`
        - `created_at`
        - `name`::Text
    - `message` 
        - `receiver`::Text (setup as foreign key on channel if you want)
        - `sender`::Text  (setup as foreign key on channel if you want)
        - `channel`::Text
- file in your own keys in the `.env` file

ex: 
```bash
box dev "$(ls ./some/dir)" # sends the out put of a bash command to the dev channel
```