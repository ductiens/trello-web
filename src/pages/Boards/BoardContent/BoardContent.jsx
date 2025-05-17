import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";

import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";

import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "~/utils/formatters";

//Để làm giữ chỗ
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";

import { MouseSensor, TouchSensor } from "~/customLibraries/DndKitSensors";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

function BoardContent({ board, createNewColumn, createNewCard, moveColumns }) {
  // const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, "_id");

  // State lưu danh sách cột đã được sắp xếp theo columnOrderIds
  const [orderedColumns, setOrderedColumns] = useState([]);
  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  //Cùng 1 thời điểm chỉ có 1 phần tử đang đc kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null); //Lưu ID của phần tử đang được kéo (cột hoặc thẻ).
  const [activeDragItemType, setActiveDragItemType] = useState(null); //Lưu loại phần tử đang kéo (COLUMN hoặc CARD).
  const [activeDragItemData, setActiveDragItemData] = useState(null); //Lưu dữ liệu của phần tử đang kéo (ví dụ: object cột hoặc thẻ).
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null);

  //Điểm va chạm cuối cùng trước nó
  const lastOverId = useRef(null);

  //Tìm Column theo CardId
  const findColumnByCardId = (cardId) => {
    //Lưu ý: nên dùng c.card thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ làm giữ liệu cho cards
    //hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find((column) => column?.cards?.map((card) => card._id)?.includes(cardId));
  };

  //Function chung xử lý Cập nhật lại state trong tường hợp di chuyển Card giữa các Column khác nhau
  const moveCardBetweenDifferenceColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    //Khi kéo phải cập nhật state để state biết nó đang kéo đến vị trí nào và nó thả đến vị trí ấy
    setOrderedColumns((prevColumns) => {
      //Tìm vị trí index(0, 1, 2,...) của overCard trong column đích (nơi mà activeCard sắp đc thả)
      const overCardIndex = overColumn?.cards?.findIndex((card) => card._id === overCardId);

      //Logic tính toán "cardIndex mới" (trên hoặc dưới overCard) lấy chuẩn ra từ code thư viện - khó hiểu
      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1;

      //Clone mảng orderedColumns cũ ra một cái mới để sửa lý data rồi return - cập nhật lại orderedColumns mới
      const nextColumns = cloneDeep(prevColumns);
      //Vì clone mới dữ liệu nên phải tìm lại nextActiveColumn, nextOverColumn ở trong mảng nextColumns để
      //không động chạm đến dữ liệu trên activeColumn, overColumn
      const nextActiveColumn = nextColumns.find((column) => column._id === activeColumn._id);
      const nextOverColumn = nextColumns.find((column) => column._id === overColumn._id);

      //nextActiveColumn: Column cũ
      if (nextActiveColumn) {
        //Xóa card ở column active (cũng có thể hiểu là column cũ, cái mà lúc kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter((card) => card._id !== activeDraggingCardId);

        //Thêm Placeholder Card nếu Column rỗng: Bị kéo hết Card đi, không còn cái nào nữa
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

        //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((card) => card._id);
      }
      //Column mới
      if (nextOverColumn) {
        //Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter((card) => card._id !== activeDraggingCardId);

        //Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card
        //giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        };

        //Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí Index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData);

        //Xóa cái Placeholder Card đi nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter((card) => !card.FE_PlaceholderCard);

        //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map((card) => card._id);
      }

      return nextColumns;
    });
  };

  //Trigger khi bắt đầu kéo (drag) một phần tử (cột hoặc thẻ)
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)
    setActiveDragItemId(event?.active?.id);
    setActiveDragItemType(
      event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);
    // event?.active?.data?.current: Lấy dữ liệu của phần tử đang kéo (object chứa thông tin cột hoặc thẻ, như title, cards, v.v.).

    //Nếu mà kéo Card thì mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
    }
  };

  //Trigger khi bắt đầu kéo (drag) một phần tử
  const handleDragOver = (event) => {
    //Không làm gì thêm khi kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    //Còn nếu kéo Card thì sử lý thêm để kéo Card qua lại giữa các Column
    const { active, over } = event;
    //Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì
    //(tránh crash trang)
    if (!active || !over) return;

    //activeDraggingCardId: Là cái Card đang đc kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    //overCardId: Là cái Card đang tương tác trên hoặc dưới so với cái Card đang đc kéo ở trên
    const { id: overCardId } = over;

    //Tìm 2 Columns theo CardId
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    //Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang
    if (!activeColumn || !overColumn) return;

    //Xử lý logic ở đây khi chỉ kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu
    //của nó thì không làm gì
    //vì ở đây đang là sử lý lúc kéo(handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    //lúc kéo trong cùng column thì không thấy vấn đề, ngon rồi. Nhưng khi kéo sang Column khác không thấy gì.
    //Nên mới viết code để sử lý
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferenceColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      );
    }
  };

  //Trigger khi kết thúc hành kéo (drag) 1 phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    const { active, over } = event;

    //Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì
    //(tránh crash trang)
    if (!active || !over) return;

    //---------------------Xử lý kéo thả Card---------------------
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDraggingCardId: Là cái Card đang đc kéo
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;
      //overCardId: Là cái Card đang tương tác trên hoặc dưới so với cái Card đang đc kéo ở trên
      const { id: overCardId } = over;

      //Tìm 2 Columns theo CardId
      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      //Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang
      if (!activeColumn || !overColumn) return;

      //Hành động kéo card qua 2 column khác nhau
      //Phải dùng tới activeDragItemData.columnIds hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart)
      //chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của
      //card đã bị cập nhật 1 lần rồi
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferenceColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        );
      }
      //Hành động kéo card trong cùng 1 cái column
      else {
        //Lấy vị trí cũ từ thằng oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex((c) => c._id === activeDragItemId);
        //Lấy vị trí mới từ thằng overColumn
        const newCardIndex = overColumn?.cards?.findIndex((c) => c._id === overCardId);

        //Dùng arrayMove vì kéo card trong 1 cái column thì tương tự với logic kéo column trong 1 cái board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex);
        // console.log("dndOrderedCards", dndOrderedCards)

        setOrderedColumns((prevColumns) => {
          //Clone mảng orderedColumns cũ ra một cái mới để sửa lý data rồi return - cập nhật lại orderedColumns mới
          const nextColumns = cloneDeep(prevColumns);

          //Tìm tới column mà chúng ta đang thả
          const targetColumn = nextColumns.find((column) => column._id === overColumn._id);

          //Cập nhật lại 2 giá trị mới của card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id);

          //Trả vè giá trị state mới (chuẩn vị trí)
          return nextColumns;
        });
      }
    }

    //---------------------Xử lý kéo thả Column trong 1 cái boardContent---------------------
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      //nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        //Lấy vị trí cũ từ thằng active
        const oldColumnIndex = orderedColumns.findIndex((c) => c._id === active.id);
        //Lấy vị trí mới từ thằng over
        const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id);

        //Dùng arrayMove của dnd-kit dể sắp xếp lại mảng Column ban đầu
        //Code của arrayMove: https://github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex);
        //2 cái console.log dữ liệu này để sau này dùng để sử lý gọi API
        // const dndOrderedColumnsIds = orderedColumns.map((c) => c._id);
        // console.log("dndOrderedColumns: ", dndOrderedColumns);
        // console.log("dndOrderedColumnsIds: ", dndOrderedColumnsIds);

        /**Gọi lên props function moveColumns nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Nên đưa dữ liệu Board rea ngoài Redux Global Store và lúc này ta có thể gọi luôn API ở đây là xong
         * thay vì phải lần lượt gọi ngược lên những component cha phía trên. Đối với component con nằm càng sâu thì càng khổ
         * Sử dụng Redux code sẽ Clean chuẩn chỉnh hơn rất nhiều
         */
        moveColumns(dndOrderedColumns);

        //Vẫn gọi update State ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ goi API
        //Cập nhật lại state columns ban đầu sau khi đã kéo thả
        setOrderedColumns(dndOrderedColumns);
      }
    }

    //Những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null ban đầu
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
  };

  //https://docs.dndkit.com/api-documentation/sensors
  // Yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  //Nếu dùng PointerSensor mặc định phải kết hợp với thuộc tính CSS touch-action: none ở phần tử kéo thả - nhưng
  //mà còn bug
  // const pointerSensor = useSensor(PointerSensor, {activationConstraint: { distance: 10 },});

  const mouseSensor = useSensor(MouseSensor, {
    // Yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    //Nhấn gữi 250ms và dung sai của cảm ứng(dễ hiểu là di chuyển chênh lệch 5px) thì mới kích hoạt event
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  // const sensors = useSensors(pointerSensor);

  //Ưu tiên sử dụng kết hợp 2 loại sensor là mouse và touch để có trải nghiệm trên mobile tốt nhất, ko bị bug
  //Còn sử dụng pointer sẽ bị bug trên mobile
  const sensors = useSensors(mouseSensor, touchSensor);

  //Animation khi thả (drop) phẩn tử - Test bằng cách kéo xong thả trực tiếp và nhìn phần giữ chỗ Overlay
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: 0.5,
        },
      },
    }),
  };

  //Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  //args = arguments = Các đối số, tham số
  const collisionDetectionStrategy = useCallback(
    (args) => {
      //Trường hợp kéo column thì dùng thuật toán closestCorners là chuẩn nhất
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      //Tìm các điểm giao nhau, va chạm, trả về 1 mảng các va chạm - intersections với con trỏ
      const pointerIntersections = pointerWithin(args);

      //Fix triệt để cái bug thư viện dnd-kit trong trường hợp sau
      // - Kéo 1 cái card có image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
      if (!pointerIntersections?.length) return;

      //Thật toán phát hiện va chạm sẽ trả về 1 mảng các va chạm ở đây - không cần bước này nữa
      // const intersections = pointerIntersections?.length > 0 ? pointerIntersections : rectIntersection(args);

      //Tìm overId đầu tiên trong đám pointerIntersections ở trên
      let overId = getFirstCollision(pointerIntersections, "id");

      if (overId) {
        //Nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán
        //phát hiện va chạm closestCenter hoặc closestCorners đều đc. Tuy nhiên ở đây dùng closestCorners vì thấy
        //mượt mà hơn
        const checkColumn = orderedColumns.find((column) => column._id === overId);

        if (checkColumn) {
          // console.log('overId before: ', overId)
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) => {
              return container.id !== overId && checkColumn?.cardOrderIds?.includes(container.id);
            }),
          })[0]?.id;
          // console.log('overId after: ', overId)
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );

  return (
    <DndContext
      //Cảm biến
      sensors={sensors}
      //Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua column đc vì lúc này
      //đang bị conflict giữa card và column), chúng ta sẽ dùng closestCorners thay cho closestCenter
      //Update: nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu
      // collisionDetection={closestCorners}

      //Tự custom nâng cao thuật toán phát hiện va chạm
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          bgcolor: (theme) => (theme.palette.mode === "dark" ? "#34495e" : "#1976d2"),
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          p: "10px 0",
        }}
      >
        <ListColumns columns={orderedColumns} createNewColumn={createNewColumn} createNewCard={createNewCard} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && <Column column={activeDragItemData} />}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  );
}

export default BoardContent;
