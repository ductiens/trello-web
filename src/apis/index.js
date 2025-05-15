import axios from "axios";
import { API_ROOT } from "~/utils/constants";

/**
 * Lưu ý: Đối với việc sử dụng axios
 * Tất cả các function bên dưới chỉ request và lấy data từ response luôn, mà không try-catch hay then-catch để bắt lỗi
 * Lý do là vì phía Front-End không cần thiết phải làm như vậy đối với mọi request bởi vì nó sẽ gây ra việc dư thừa code
 * catch quá nhiều
 * Giải pháp Clean Code gọn gàng là: catch lỗi tập trung tại 1 nơi bằng cách tận dụng 1 thứ cực mạnh trong axios đó
 * là Interceptors
 * Hiểu đơn giản  Interceptors đánh chặn vào giữa request hoặc response để xử lý logic mà ta muốn
 */

export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
  //Lưu ý: axios trả kết quả về qua property của nó là data
  return response.data;
};
