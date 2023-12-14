import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface StoreState {
  answerText: string;
  queryString: string;
  isComplete: boolean;
  questionLoading: boolean;
  isStart: boolean;
  typingStart: boolean;
  isFirst: boolean;
}

interface StoreAction {
  reset(): void;
  addAnswerText: (text: StoreState["answerText"]) => void;
  setAnswerText: (text: StoreState["answerText"]) => void;
  setIsComplete: (complete: StoreState["isComplete"]) => void;
  setQueryString: (query: StoreState["queryString"]) => void;
  setIsStart: (start: StoreState["isStart"]) => void;
  setTypingStart: (start: StoreState["typingStart"]) => void;
  setQuestionLoading: (loading: StoreState["questionLoading"]) => void;
  setIsFirst: (first: StoreState['isFirst']) => void;
 }

type Store = StoreState & StoreAction;

export const useQuestionStore = create<Store, [["zustand/immer", Store]]>(
  immer((set) => ({
    answerText: "",
    queryString: "",
    isStart: false,
    isComplete: false,
    typingStart: false,
    questionLoading:true,
    isFirst: true,
    reset() {
      set((state) => {
        state.answerText = "";
        state.queryString = "";
        state.isStart = false;
        state.isFirst = false;
        state.isComplete = false;
      });
    },
    setIsFirst(first) {
      set(state=>{
        state.isFirst = first
      })
    },
    setQuestionLoading(loaindg) {
      set((state) => {
        state.questionLoading = loaindg;
      })
    },
    setIsComplete(complete) {
      set((state) => {
        state.isComplete = complete;
      });
    }, 
    addAnswerText(text) {
      set((state) => {
        state.answerText += text;
      });
    },
    setQueryString(query) {
        set((state) => {
        state.queryString = query;
      });
  
    },
    setIsStart(start) {
        set((state)=> {
          state.isStart = start;
        })
    },
    setTypingStart(start) {
      set((state)=> {
        state.typingStart = start;
      })
    },
    setAnswerText(text) {
      set((state)=>{
        state.answerText = text
      })
    }
  }))
);
