import { resolve } from "url";

const tagsView = {
    state: {
        visitedViews: [],
        cachedViews: []
    },
    mutations: {
        ADD_VISITED_VIEW: (state, view) => {
            if(state.visitedViews.some(v => v.path === view.path)) return; //避免添加重复的tag
            state.visitedViews.push(Object.assign({}, view, {
                title: view.meta.title || 'no-name'
            }))
        },
        DEL_VISITED_VIEW: (state, view) => {
            for(const [i, v] of state.visitedViews.entries()) {
                if(v.path == view.path){
                    state.visitedViews.splice(i,1);
                    break;
                }
            }
        }
    },
    actions: {
        addView({ commit },view) {
            commit('ADD_VISITED_VIEW',view)
        },
        delView({ commit, state }, view) {
            return new Promise(resolve => {
                commit('DEL_VISITED_VIEW', view)
                resolve({visitedViews: [...state.visitedViews]}) //给then传值
            })
        }
    }
}
export default tagsView