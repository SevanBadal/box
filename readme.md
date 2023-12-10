# Box
[![NPM](https://img.shields.io/npm/v/channel-box)](https://www.npmjs.com/package/channel-box)

A terminal message passing app powered by [Supabase](https://supabase.com/) with authentication and realtime messaging support: `box open global`

| recommended node versions: `v16-17`
## Setup
1. clone this repo
2. create a `.env` file in the root project dir (contact me for keys if you want the global database!)
3. `npm i`
4. `npm link`
5. run `box --help` for a list of commands

## Self Hosted
- create an `.env` file and provide the values specified in `.env.example`
- create a supabase project with the following tables
<img width="1154" alt="image" src="https://github.com/SevanBadal/box/assets/41360054/99889d33-4fad-4a25-9eba-6d1c696b4a67">
- add the following RLS policies
<img width="1161" alt="image" src="https://github.com/SevanBadal/box/assets/41360054/ba8feacb-23fb-44e1-818f-252626ce6e53">
<img width="1161" alt="image" src="https://github.com/SevanBadal/box/assets/41360054/69c75bc6-0882-4049-ae6e-ebb30821fb4d">
<img width="1161" alt="image" src="https://github.com/SevanBadal/box/assets/41360054/e9a3043f-4534-491e-a746-c5dfdcb02d5a">
<img width="1161" alt="image" src="https://github.com/SevanBadal/box/assets/41360054/56d111af-6ffa-429c-bc58-0df055d8e722">

`Channels` are public but you could enable RLS for them as well. 


ex `box` command: 
```bash
box ship dev "$(ls ./some/dir)" # sends the out put of a bash command to the dev channel
```
run `box` for details!
