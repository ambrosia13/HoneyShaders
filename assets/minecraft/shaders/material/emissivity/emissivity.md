# Material shader emissivity

Just some notes for myself and others when I work on material shader emissivity some more.

- To achieve HDR effects for emissive materials modify `frx_fragColor` or `frx_sampleColor` above 1.0. 
- Never set `frx_fragEmissive` above 1.0 
- `frx_fragEmissive` main purpose is just the mask for which colors are marked emissive.  