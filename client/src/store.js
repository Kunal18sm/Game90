import { create } from 'zustand';
import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

const DEFAULT_INVENTORY = { banana: 0, fish: 0, clothes: 0 };

export const useStore = create((set, get) => ({
    user: null, // Holds { username, token, ... }
    socket: null, // Holds socket.io connection
    remotePlayers: {}, // List of other players in the game

    activeShopPanel: null,
    points: 1000,
    energy: 100, // 100% full
    inventory: { banana: 0, fish: 0, clothes: 0 },

    // --- Auth & Multiplayer Actions --- //
    loginSuccess: (userData, token) => {
        const normalizedUser = {
            ...userData,
            points: userData.points ?? 1000,
            energy: userData.energy ?? 100,
            inventory: { ...DEFAULT_INVENTORY, ...(userData.inventory ?? {}) },
            position: {
                x: userData.position?.x ?? 0,
                y: userData.position?.y ?? 0,
                z: userData.position?.z ?? 15
            },
            rotationY: userData.rotationY ?? 0
        };

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        // Set initial state
        set({
            user: { ...normalizedUser, token },
            socket: newSocket,
            points: normalizedUser.points,
            energy: normalizedUser.energy,
            inventory: normalizedUser.inventory
        });

        // Setup socket listeners
        newSocket.on('connect', () => {
            newSocket.emit('join_game', normalizedUser);
        });

        newSocket.on('current_players', (players) => {
            const others = { ...players };
            delete others[newSocket.id]; // remove self
            set({ remotePlayers: others });
        });

        newSocket.on('player_joined', (player) => {
            set((state) => ({
                remotePlayers: { ...state.remotePlayers, [player.id]: player }
            }));
        });

        newSocket.on('player_moved', (player) => {
            set((state) => {
                const currentPlayers = { ...state.remotePlayers };
                if (currentPlayers[player.id]) {
                    currentPlayers[player.id].x = player.x;
                    currentPlayers[player.id].y = player.y;
                    currentPlayers[player.id].z = player.z;
                    currentPlayers[player.id].rotationY = player.rotationY;
                    currentPlayers[player.id].animating = player.animating;
                } else {
                    currentPlayers[player.id] = player;
                }
                return { remotePlayers: currentPlayers };
            });
        });

        newSocket.on('player_left', (id) => {
            set((state) => {
                const updated = { ...state.remotePlayers };
                delete updated[id];
                return { remotePlayers: updated };
            });
        });
    },

    logout: () => {
        const { socket } = get();
        if (socket) socket.disconnect();
        set({
            user: null,
            socket: null,
            remotePlayers: {},
            activeShopPanel: null,
            points: 1000,
            energy: 100,
            inventory: DEFAULT_INVENTORY
        });
    },

    // --- Game Actions --- //

    setActiveShopPanel: (type) => {
        if (get().activeShopPanel !== type) {
            set({ activeShopPanel: type });
        }
    },
    buyItem: (cost, itemType) => set((state) => {
        if (state.points >= cost) {
            return {
                points: state.points - cost,
                inventory: { ...state.inventory, [itemType]: state.inventory[itemType] + 1 }
            };
        }
        return state; // Not enough points
    }),
    eatItem: (itemType) => set((state) => {
        if (state.inventory[itemType] > 0) {
            let energyBoost = 0;
            if (itemType === 'banana') energyBoost = 50;
            if (itemType === 'fish') energyBoost = 75;

            return {
                inventory: { ...state.inventory, [itemType]: state.inventory[itemType] - 1 },
                energy: Math.min(100, state.energy + energyBoost)
            };
        }
        return state;
    }),
    drainEnergy: (amount) => set((state) => ({
        energy: Math.max(0, state.energy - amount)
    }))
}));
