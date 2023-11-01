# hardhat-sentio

https://www.npmjs.com/package/@sentio/hardhat-sentio

## Usage

1. Login with sentio sdk first

``` bash
yarn add -D @sentio/cli
npx sentio login
```

3. `yarn add -D @sentio/hardhat-sentio`

4. Modify `hardhat.config.ts`

``` typescript
import "@sentio/hardhat-sentio"

const config: HardhatUserConfig = {
  sentio: {
    project: "longw/default"
  }
}
```

4. Upload and verify contracts with CLI

```
npx hardhat sentio:upload Executor,Router

npx hardhat sentio:verify --contract Router --address 0xE03441E04F1f602e8Eb3ab80735a79880CA05AE5 --chain 137
```
