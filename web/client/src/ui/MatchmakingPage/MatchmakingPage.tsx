import { useState } from "react";
import { useUiState } from "@hooks";
import { GameState } from "@models";

const MatchmakingPage: React.FC = () => {
    const [uiState] = useUiState();
    const { socialMediaNetworks, gameClient, gameState } = uiState;


    const [playerName, setPlayerName] = useState('');
    const [socialMediaNetwork, setSocialMediaNetwork] = useState('facebook');

    if (!uiState) {
        return <div>Loading...</div>;
    }
    if (uiState.gamePhase === 'WaitingForPlayers') {
        return (
            <div className="w-full content-center flex flex-col items-center bg-smw-blue-700">
            <div className="max-w-xl flex flex-col items-center space-y-4">
            <div className="text-3xl font-bold pt-10 text-smw-orange-500"><h1>Waiting for players</h1></div>            
            <div className="text-xl pb-12 text-smw-yellow-500"><h2>{gameState?.fields.length} players joined ...</h2></div>        
            {gameClient?.player?.fieldId == 0 &&
                <div className="rounded-md shadow">              
                    <input type="button" className="flex w-full items-center justify-center rounded-md border border-transparent bg-smw-yellow-500 px-8 py-3 text-base font-medium text-white hover:bg-smw-orange-700 md:py-4 md:px-10 md:text-lg" value="Start Game" onClick={() => uiState.gameClient.startGame()} />
                </div>
            }
             
            </div>
            </div>            
        )
    }

    return (
        <div className="w-full content-center flex flex-col items-center bg-smw-blue-700">
            <div className="max-w-xl flex flex-col items-center space-y-4">
            <div className="text-3xl font-bold pt-10 text-smw-orange-500"><h1>Welcome to socialmediawars.io!</h1></div>            
            <div className="text-xl pb-12 text-smw-yellow-500"><h2>tower like its 2005</h2></div>            
                        
            <input type="text" className="block w-full rounded-md py-2 pl-7 pr-12 focus:border-smw-yellow-500 focus:ring-smw-yellow-500 sm:text-sm" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />

            <div className="flex flex-row">
                {socialMediaNetworks === undefined ? (
                    <p>Loading Network types...</p>
                ) : socialMediaNetworks.map((network) => (
<div key={network.key} className="">
        <div className={`${socialMediaNetwork === network.key ? 'border-[#ffffff]' : 'border-[#000000]'} border-2 min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-80`}
            onClick={() => setSocialMediaNetwork?.(network.key)}            
        >
          <img src={`assets/network/${network.key}.jpg`} alt="{network.description}" className="h-full w-full object-cover object-center lg:h-full lg:w-full">
            </img>
        </div>
        <div className="mt-4 flex justify-between content-center">
          <div className="">
              <div className="text-xl text-smw-yellow-500">
                
                {network.name}
              </div>
            <p className="mt-1 text-sm text-white">{network.description}</p>
          </div>          
        </div>
      </div> 
                ))}
            </div>
            <div className="rounded-md shadow">              
                <input type="button" className="flex w-full items-center justify-center rounded-md border border-transparent bg-smw-yellow-500 px-8 py-3 text-base font-medium text-white hover:bg-smw-orange-700 md:py-4 md:px-10 md:text-lg" value="Join Game" onClick={() => uiState.gameClient.joinGame(playerName, socialMediaNetwork)} />
            </div>
            
        </div>
        </div>
    );
}

export default MatchmakingPage;

{/* <input
                        type="button"
                        key={network.key}
                        value={`${network.name}`}
                        title={`${network.description}`}
                        onClick={() => setSocialMediaNetwork?.(network.key)}
                        style={{ margin: '0 2px', padding: '4px', backgroundColor: socialMediaNetwork === network.key ? 'lightblue' : undefined }}
                    /> */}