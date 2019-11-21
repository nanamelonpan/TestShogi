import { vuexfireMutations, firestoreAction } from 'vuexfire';
export const state = () => ({
   games: [],
});
export const mutations = {
   ...vuexfireMutations
};
export const actions = {
   setGamesRef: firestoreAction(function (context, ref) {
       context.bindFirestoreRef('games', ref)
   }),
};
export const getters = {
   games: state => state.games
};
