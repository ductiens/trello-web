//Boards details
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";

// import { mockData } from "~/apis/mock-data";
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI } from "~/apis";
import { generatePlaceholderCard } from "~/utils/formatters";
import { isEmpty } from "lodash";

function Board() {
  const [board, setBoard] = useState(null);
  useEffect(() => {
    //Tạm thời fix cứng boardId, ta dùng react-router-dom để lấy boardId từ URL về
    const boardId = "6827e9c071f956a74e881e32";
    //Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      //Khi F5 trang web thì cần xử lý vấn đề kéo thả vào 1 column rỗng
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        }
      });
      setBoard(board);
    });
  }, []);

  //Func này có nhiệm vụ gọi API tạo mới Column và làm lại dữ liệu State Board
  const createNewColumn = async (newColumnData) => {
    const createColumn = await createNewColumnAPI({ ...newColumnData, boardId: board._id });
    // console.log("createColumn", createColumn);
    // boardId: "6827e9c071f956a74e881e32";
    // cardOrderIds: [];
    // cards: [];
    // createdAt: 1747453148760;
    // title: "Column 321";
    // updatedAt: null;
    // _destroy: false;
    // _id: "682804dcf55125dae73ab1fa";

    //Khi tạo column mới thì nó sẽ chưa có card, cần xử lý vấn đề kéo thả vào 1 column rỗng
    createColumn.cards = [generatePlaceholderCard(createColumn)];
    createColumn.cardOrderIds = [generatePlaceholderCard(createColumn)._id];

    //Cập nhật state board
    //Phía Front-end chúng ta phải tự làm đúng lại state data board (thay vì phải gọi lại API fetchBoardDetailsAPI)
    //Lưu ý: Cách này phụ thuộc tùy vào lựa chọn và đặc thù dự án, có nơi BE sẽ hỗ trợ trả về toàn bộ board dù đây có là
    //API tạo column hay card đi chăng nữa
    const newBoard = { ...board };
    newBoard.columns.push(createColumn);
    newBoard.columnOrderIds.push(createColumn._id);
    setBoard(newBoard);
  };

  //Func này có nhiệm vụ gọi API tạo mới Card và làm lại dữ liệu State Board
  const createNewCard = async (newCardData) => {
    const createCard = await createNewCardAPI({ ...newCardData, boardId: board._id });
    // console.log("createCard", createCard);
    // boardId: "6827e9c071f956a74e881e32";
    // columnId: "68280126f55125dae73ab1f8";
    // createdAt: 1747453088478;
    // title: "123";
    // updatedAt: null;
    // _destroy: false;
    // _id: "682804a0f55125dae73ab1f9";

    //Cập nhật state board
    //Phía Front-end chúng ta phải tự làm đúng lại state data board (thay vì phải gọi lại API fetchBoardDetailsAPI)
    //Lưu ý: Cách này phụ thuộc tùy vào lựa chọn và đặc thù dự án, có nơi BE sẽ hỗ trợ trả về toàn bộ board dù đây có là
    //API tạo column hay card đi chăng nữa
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find((column) => column._id === createCard.columnId);
    if (columnToUpdate) {
      columnToUpdate.cards.push(createCard);
      columnToUpdate.cardOrderIds.push(createCard);
    }
    setBoard(newBoard);
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} createNewColumn={createNewColumn} createNewCard={createNewCard} />
    </Container>
  );
}

export default Board;
