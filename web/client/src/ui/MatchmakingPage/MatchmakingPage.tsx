import { useState } from "react";
import { useUiState } from "@hooks";

const MatchmakingPage: React.FC = () => {
    const [uiState] = useUiState();
    const { socialMediaNetworks } = uiState;


    const [playerName, setPlayerName] = useState('');
    const [socialMediaNetwork, setSocialMediaNetwork] = useState('facebook');

    if (!uiState) {
        return <div>Loading...</div>;
    }
    if (uiState.gamePhase === 'WaitingForPlayers') {
        return (
            <div>
                <h1 className="text-3xl font-bold underline">Waiting for players</h1>
                <p>Waiting for other players to join the game.</p>
            </div>
        )
    }

    return (
        <div style={{ padding: '16px' }}>
            <h1>Welcome to socialmediawars.io!</h1>

            {/* Join Game Action Bar */}
            <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={{ width: '200px', marginRight: '16px' }} />
            <input type="button" value="Join Game" onClick={() => uiState.gameClient.joinGame(playerName, socialMediaNetwork)} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {socialMediaNetworks === undefined ? (
                    <p>Loading Network types...</p>
                ) : socialMediaNetworks.map((network) => (
                    <input
                        type="button"
                        key={network.key}
                        value={`${network.name}`}
                        title={`${network.description}`}
                        onClick={() => setSocialMediaNetwork?.(network.key)}
                        style={{ margin: '0 2px', padding: '4px', backgroundColor: socialMediaNetwork === network.key ? 'lightblue' : undefined }}
                    />
                ))}
            </div>
        </div>

    );
}

export default MatchmakingPage;