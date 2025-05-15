// Capitalize the first letter of a string
export const capitalizeFirstLetter = (val) => {
  if (!val) return "";
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`;
};

//Hàm generatePlaceholderCard: Cách sử lý logic thư viện dnd-kit khi column là rỗng
//Phía Front End sẽ tự tạo 1 cái card đặc biệt: Placeholder Card, không liên quan tới Back End
//Card đặc biệt này sẽ đc ẩn khỏi giao diện UI người dùng
//Cấu trúc Id của cái card này để Unique rất đơn giản, không cần phải làm random phức tạp:
//"columnId-placeholder-card" (mỗi column chỉ có thể có tối đa một cái Placeholder Card)
//Quan trong khi tạo: phải đầy đủ: (_id, boardId, columnId, FE_PlaceholderCard)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true,
  };
};
