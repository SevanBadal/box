# Box
[![NPM](https://img.shields.io/npm/v/channel-box)](https://www.npmjs.com/package/channel-box)

A terminal message passing app powered by [Supabase](https://supabase.com/) with realtime messaging support: `box open global`

| recommended node versions: `v16-17`
## Setup
1. clone this repo
2. create a `.env` file in the root project dir (contact me for keys if you want the global database!)
3. `npm i`
4. `npm link`
5. run `box --help` for a list of commands

## Self Hosted
- create a supabase project with the following tables
<img width="1154" alt="image" src="https://github.com/SevanBadal/box/assets/41360054/99889d33-4fad-4a25-9eba-6d1c696b4a67">
- create an `.env` file and provide the values specified in `.env.example`

ex `box` command: 
```bash
box dev "$(ls ./some/dir)" # sends the out put of a bash command to the dev channel
```
