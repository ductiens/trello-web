import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ContentCut from "@mui/icons-material/ContentCut";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ContentPaste from "@mui/icons-material/ContentPaste";
import Cloud from "@mui/icons-material/Cloud";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";

import ListCards from "./ListCards/ListCards";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";

import { toast } from "react-toastify";

import { useConfirm } from "material-ui-confirm";

function Column({ column, createNewCard, deleteColumnDetails }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //Cards đã đc sắp xếp ở component cha cao nhất (boards/_id.jsx)
  const orderedCards = column.cards;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column },
  }); //Hook biến cột thành một phần tử có thể kéo thả

  const dndKitColumnStyles = {
    // touchAction: "none",// fix trên điện thoại để kéo mượt hơn. Dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch(kéo dài)
    //https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    /** Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua 1 cái column dài thì phải kéo ở
     * khu vực giữa rất khó chịu. Lưu ý phải kết hợp với {...listeners} nằm ở Box chứ không phải div ngoài cùng
     * để tránh trường hợp kéo vào vùng xanh mà vẫn kéo đc
     * Đảm bảo cột luôn chiếm toàn bộ chiều cao của vùng chứa, tránh lỗi flickering khi kéo cột ngắn qua cột dài.
     */
    height: "100%",
    opacity: isDragging ? 0.5 : undefined,
  };

  const [openNewCardForm, setOpenNewCardForm] = useState(false);
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);

  const [newCardTitle, setNewCardTitle] = useState("");

  const addNewCard = () => {
    if (!newCardTitle) {
      toast.error("Please enter Card Title!", {
        position: "bottom-right",
      });
      return;
    }

    //Tạo dữ liệu Card  để gọi API
    const newCardData = {
      title: newCardTitle,
      columnId: column._id,
    };

    //Gọi API ở đây sẽ rất phiền -> gọi ở cha rồi truyền xuống
    /**Gọi lên props function createNewCard nằm ở component cha cao nhất (boards/_id.jsx)
     * Lưu ý: Nên đưa dữ liệu Board rea ngoài Redux Global Store và lúc này ta có thể gọi luôn API ở đây là xong
     * thay vì phải lần lượt gọi ngược lên những component cha phía trên. Đối với component con nằm càng sâu thì càng khổ
     * Sử dụng Redux code sẽ Clean chuẩn chỉnh hơn rất nhiều
     */
    // await createNewCard(newCardData);
    createNewCard(newCardData);

    toggleOpenNewCardForm();
    setNewCardTitle("");
  };

  //Xử lý xóa 1 Column và Cards bên trong nó dùng material-ui-confirm
  const confirmDeleteColumn = useConfirm();
  const handleClickColumn = () => {
    confirmDeleteColumn({
      title: "Delete Column",
      description: "This action will permanently delete your Column and its Cards! Are you sure?",
      confirmationText: "Confirm",
      cancellationText: "Cancel",
      // buttonOrder: ["Confirm", "Cancel"],
      // allowClose: false,
      // dialogProps: { maxWidth: "xs" },
      // cancellationButtonProps: { color: "inherit" },
      // confirmationButtonProps: { color: "secondary", variant: "outlined" },
    })
      .then(() => {
        /**Gọi lên props function deleteColumnDetails nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Nên đưa dữ liệu Board rea ngoài Redux Global Store và lúc này ta có thể gọi luôn API ở đây là xong
         * thay vì phải lần lượt gọi ngược lên những component cha phía trên. Đối với component con nằm càng sâu thì càng khổ
         * Sử dụng Redux code sẽ Clean chuẩn chỉnh hơn rất nhiều
         */
        deleteColumnDetails(column._id);
        // console.log(column._id);
        // console.log(column.title);
      })
      .catch(() => {});
  };

  //Phải bọc bởi div vì vấn đề chiều cao của column khi kéo thả sẽ có bug kiểu flickering
  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      {/* Box Column */}
      <Box
        {...listeners}
        sx={{
          minWidth: "300px",
          maxWidth: "300px",
          bgcolor: (theme) => (theme.palette.mode === "dark" ? "#333643" : "#ebecf0"),
          ml: 2,
          borderRadius: "6px",
          height: "fit-content",
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            {column?.title}
          </Typography>
          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{ color: "text.primary", cursor: "pointer" }}
                id="basic-column-dropdown"
                aria-controls={open ? "basic-menu-column-dropdown" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-column-dropdown",
              }}
            >
              <MenuItem
                onClick={toggleOpenNewCardForm}
                sx={{
                  "&:hover": {
                    color: "success.light",
                    "& .add-card-icon": { color: "success.light" },
                  },
                }}
              >
                <ListItemIcon>
                  <AddCardIcon className="add-card-icon" fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>

              <Divider />
              <MenuItem
                onClick={handleClickColumn}
                sx={{
                  "&:hover": {
                    color: "warning.dark",
                    "& .delete-forever-icon": { color: "warning.dark" },
                  },
                }}
              >
                <ListItemIcon>
                  <DeleteForeverIcon className="delete-forever-icon" fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Cloud fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* list card */}
        <ListCards cards={orderedCards} />

        {/* Footer */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnFooterHeight,
            p: 2,
          }}
        >
          {!openNewCardForm ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Button startIcon={<AddCardIcon />} onClick={toggleOpenNewCardForm}>
                Add new card
              </Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon sx={{ cursor: "pointer" }} />
              </Tooltip>
            </Box>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TextField
                label="Enter card title..."
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                data-no-dnd="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                sx={{
                  "& label": { color: "text.primary" },
                  "& input": {
                    color: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) => (theme.palette.mode === "dark" ? "#333643" : "white"),
                  },
                  "& label.Mui-focused": { color: (theme) => theme.palette.primary.main },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: (theme) => theme.palette.primary.main },
                    "&:hover fieldset": { borderColor: (theme) => theme.palette.primary.main },
                    "&.Mui-focused fieldset": { borderColor: (theme) => theme.palette.primary.main },
                  },
                  "& .MuiOutlinedInput-input": { borderRadius: 1 },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  onClick={addNewCard}
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{
                    boxShadow: "none",
                    border: "0.5px solid",
                    borderColor: (theme) => theme.palette.success.main,
                    "&:hover": { bgcolor: (theme) => theme.palette.success.main },
                  }}
                >
                  Add
                </Button>
                <CloseIcon
                  fontSize="small"
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: "pointer",
                  }}
                  onClick={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
}
export default Column;
