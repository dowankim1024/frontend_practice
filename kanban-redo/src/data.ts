import type { Board } from "./type";

export const initialBoard: Board = {
  columns: [
    {
      id: "100",
      title: "To Do",
      cards: [
        {
          id: "1",
          title: "공부하기"
        },
        {
          id: "2",
          title: "잠자기",
          description: "꿀잠잘것"
        }
      ]
    },
    {
      id: "200",
      title: "In Progress",
      cards: [
        {
          id: "3",
          title: "놀기"
        },
        {
          id: "4",
          title: "먹기",
          description: "먹다지침"
        }
      ]
    },
    {
      id: "300",
      title: "Done",
      cards: [
        {
          id: "5",
          title: "살기"
        },
        {
          id: "6",
          title: "태어나기",
          description: "죽지못해태어나기"
        }
      ]
    }
  ]
};