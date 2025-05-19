//Boards details
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";

import { mapOrder } from "~/utils/sorts";

// import { mockData } from "~/apis/mock-data";
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI,
  deleteColumnDetailsAPI,
} from "~/apis";
import { generatePlaceholderCard } from "~/utils/formatters";
import { isEmpty } from "lodash";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { toast } from "react-toastify";

function Board() {
  const [board, setBoard] = useState(null);
  useEffect(() => {
    //Tạm thời fix cứng boardId, ta dùng react-router-dom để lấy boardId từ URL về
    const boardId = "6827e9c071f956a74e881e32";
    //Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      //Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, "_id");

      board.columns.forEach((column) => {
        //Khi F5 trang web thì cần xử lý vấn đề kéo thả vào 1 column rỗng
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        } else {
          //Sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, "_id");
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
      //Nếu Column rỗng: Bản chất đang chứa 1 cái placeholder-card
      if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createCard];
        columnToUpdate.cardOrderIds = [createCard._id];
      } else {
        //Ngược lại Column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createCard);
        columnToUpdate.cardOrderIds.push(createCard._id);
      }
    }
    setBoard(newBoard);
  };

  //Func này có nhiệm vụ gọi API và xử lý khi kéo thả column xong xuôi
  //Chỉ cần goi API để cập nhật mảng columnOrderIds của Board chứa nó(thay đổi vị trí trong mảng board)
  const moveColumns = (dndOrderedColumns) => {
    //Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    setBoard(newBoard);

    //Gọi API update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds });
  };

  //Khi di chuyển Card trong Column
  //Chỉ cần goi API để cập nhật mảng cardOrderIds của Column chứa nó(thay đổi vị trí trong mảng column)
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    //Update cho chuẩn dữ liệu state Board
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find((column) => column._id === columnId);
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards;
      columnToUpdate.cardOrderIds = dndOrderedCardIds;
    }
    setBoard(newBoard);

    //Gọi API update Board
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds });
  };

  /**Khi di chuyển Card sang Column khác:
   * B1: cập nhật mảng cardOrderIds của column ban đầu chứa nó (Nghĩa là xóa cái _id của Card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của column tiếp theo (Thêm _id card vào mảng)
   * B3: Cập nhật lại trường columnId mới của Card đã kéo
   * => Làm 1 API support riêng
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    //Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    setBoard(newBoard);

    //Gọi API xử lý BE
    let prevCardOrderIds = dndOrderedColumns.find((column) => column._id === prevColumnId)?.cardOrderIds;
    //Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column,  Column rỗng sẽ có placeholder-card, cần xóa nó đi trc khi gửi lên BE
    if (prevCardOrderIds[0].includes("placeholder-card")) prevCardOrderIds = [];

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find((column) => column._id === nextColumnId)?.cardOrderIds,
    });
  };

  //Xử lý xóa 1 Column và Cards bên trong nó
  const deleteColumnDetails = (columnId) => {
    //Update cho chuẩn dữ liệu state Board
    const newBoard = { ...board };
    newBoard.columns = newBoard.columns.filter((column) => column._id !== columnId);
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter((_id) => _id !== columnId);
    setBoard(newBoard);

    //Gọi API xử lý BE
    deleteColumnDetailsAPI(columnId).then((res) => {
      toast.success(res?.deleteResult);
    });
  };

  if (!board) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "100vw",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    );
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
        deleteColumnDetails={deleteColumnDetails}
      />
    </Container>
  );
}

export default Board;
