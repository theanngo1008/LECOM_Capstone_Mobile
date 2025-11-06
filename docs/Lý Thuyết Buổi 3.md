# Làm chủ Server State trong React Native: Phân tích sâu về TanStack Query

---

## Phần 1: Sự thay đổi trong tư duy: Từ Fetch thủ công đến Server State khai báo

Phần này thiết lập nền tảng cho câu hỏi "tại sao", phân tích sâu vào mô hình cũ còn nhiều vấn đề và giới thiệu triết lý cốt lõi của TanStack Query, tạo tiền đề cho toàn bộ báo cáo.

### 1.1 Phân tích mô hình `fetch` + `useEffect` trong React Native

Trong hệ sinh thái React, việc tìm nạp dữ liệu từ xa là một tác vụ cơ bản. Theo truyền thống, các nhà phát triển thường dựa vào sự kết hợp của API `fetch` (hoặc một thư viện tương tự như Axios) bên trong hook `useEffect`. Mặc dù cách tiếp cận này có thể hoạt động đối với các ứng dụng đơn giản, nhưng nó nhanh chóng bộc lộ những hạn chế nghiêm trọng khi quy mô và độ phức tạp của ứng dụng tăng lên, đặc biệt là trong môi trường React Native.

#### Gánh nặng quản lý State thủ công

Mô hình `fetch` + `useEffect` buộc nhà phát triển phải quản lý một cách thủ công ít nhất ba trạng thái riêng biệt cho mỗi yêu cầu dữ liệu: trạng thái cho dữ liệu (`data`), trạng thái tải (`loading`), và trạng thái lỗi (`error`).[1, 2] Đoạn mã boilerplate này không chỉ dài dòng mà còn dễ phát sinh lỗi và phải được lặp lại cho mọi yêu cầu dữ liệu khác nhau trong ứng dụng, dẫn đến mã nguồn cồng kềnh và khó bảo trì.[2]

#### Khoảng trống về Caching

Mô hình này không cung cấp bất kỳ cơ chế caching (bộ nhớ đệm) tích hợp nào.[2, 3] Trong bối cảnh React Native, điều này gây ra những hậu quả trực tiếp và tiêu cực:

*   **Yêu cầu mạng không cần thiết:** Khi một component bị unmount (ví dụ: điều hướng khỏi một màn hình) và sau đó remount (quay trở lại màn hình đó), hook `useEffect` sẽ chạy lại, kích hoạt một lệnh gọi API dư thừa cho cùng một dữ liệu.[2, 4] Điều này làm lãng phí băng thông và pin, những tài nguyên quan trọng trong môi trường di động.
*   **Trải nghiệm người dùng kém:** Người dùng buộc phải nhìn thấy chỉ báo tải (loading indicator) mỗi khi họ quay lại một màn hình, ngay cả khi dữ liệu không thay đổi, khiến ứng dụng có cảm giác chậm chạp và không phản hồi nhanh.[2]

#### Thách thức của dữ liệu cũ (Stale Data)

Khái niệm về dữ liệu "cũ" (stale) không tồn tại trong mô hình này. Không có cơ chế nào để biết liệu dữ liệu đang hiển thị có còn đồng bộ với máy chủ hay không.[2, 5] Điều này có thể dẫn đến việc người dùng đưa ra quyết định dựa trên thông tin đã lỗi thời.

#### Sự phức tạp của Logic nâng cao

Một nỗ lực đáng kể là cần thiết để triển khai thủ công các tính năng cần thiết cho một ứng dụng hiện đại, chẳng hạn như chống trùng lặp yêu cầu (request deduplication), thử lại các yêu cầu thất bại với thuật toán exponential backoff, và xử lý các điều kiện chạy đua (race conditions) khi một yêu cầu cũ hơn lại hoàn thành sau một yêu cầu mới hơn.[1, 2, 6] Ngay cả đội ngũ phát triển React cũng thừa nhận rằng `useEffect` không phải là công cụ lý tưởng cho việc tìm nạp dữ liệu.[2]

### 1.2 Giới thiệu Server State: Triết lý cốt lõi của TanStack Query

Vấn đề cốt lõi của `useEffect` trong việc tìm nạp dữ liệu không phải là một khiếm khuyết trong bản thân hook, mà là một sự không tương thích về mặt kiến trúc. Nó xử lý trạng thái máy chủ (server state) - vốn không đồng bộ và thuộc sở hữu từ xa - bằng các công cụ được thiết kế cho trạng thái giao diện người dùng (UI state) - vốn đồng bộ và thuộc sở hữu của client.

#### Định nghĩa Server State

Để giải quyết vấn đề này, cần phải hiểu rõ sự khác biệt quan trọng giữa **Client State** (ví dụ: chủ đề giao diện, dữ liệu nhập trong biểu mẫu) và **Server State**.[5, 7] Server state về cơ bản là khác biệt vì nó:

*   Được lưu trữ từ xa ở một nơi mà client không kiểm soát hoặc sở hữu.[5, 8]
*   Yêu cầu các API không đồng bộ để tương tác.[5, 8]
*   Có quyền sở hữu chung và có thể bị thay đổi bởi những người khác mà client không hề hay biết.[5, 8]
*   Có khả năng trở nên "lỗi thời" trong ứng dụng của chúng ta.[5, 8] ~ 

#### TanStack Query như một công cụ chuyên dụng

Dựa trên định nghĩa này, TanStack Query (trước đây là React Query) không phải là một sự thay thế cho các trình quản lý trạng thái toàn cục như Redux hay Zustand, mà là một thư viện chuyên dụng, được xây dựng có mục đích để quản lý vòng đời độc nhất của server state.[5, 7] Nó được mô tả là "thư viện tìm nạp dữ liệu còn thiếu", giải quyết tất cả các thách thức đã nêu ở trên một cách tự động.[1, 5] Việc áp dụng TanStack Query đại diện cho một sự thay đổi từ mô hình *mệnh lệnh* ("hãy tìm nạp dữ liệu này ngay bây giờ và đặt nó vào một biến state") sang mô hình *khai báo* ("component này phụ thuộc vào dữ liệu máy chủ này"). Cách tiếp cận khai báo này cho phép thư viện tự động quản lý sự phức tạp của việc tìm nạp, caching và đồng bộ hóa, dẫn đến mã nguồn mạnh mẽ và dễ bảo trì hơn.

## Phần 2: Kiến trúc cốt lõi của TanStack Query

Phần này đi sâu vào câu hỏi "làm thế nào", giải thích các hook chính và cơ chế caching tạo nên xương sống của thư viện.

### 2.1 `useQuery` - Nền tảng của việc tìm nạp dữ liệu khai báo

`useQuery` là hook cơ bản nhất và được sử dụng thường xuyên nhất trong TanStack Query. Nó đóng vai trò là nền tảng cho việc tìm nạp, caching và quản lý dữ liệu từ máy chủ một cách khai báo.

#### Cấu trúc của `useQuery`

Hook `useQuery` nhận vào một đối tượng cấu hình với hai thuộc tính thiết yếu [9, 10]:

*   `queryKey`: Một mảng duy nhất, có thể tuần tự hóa, hoạt động như một định danh cho một mẩu dữ liệu. Khóa này là nền tảng của việc caching, chia sẻ và tìm nạp lại.[9, 11, 12] Cấu trúc của khóa này rất quan trọng để có thể mở rộng ứng dụng.
*   `queryFn`: Hàm không đồng bộ trả về một promise, chịu trách nhiệm tìm nạp dữ liệu thực tế.[9, 13] Hàm này có thể là một lệnh gọi `fetch`, một yêu cầu Axios, hoặc bất kỳ hàm nào trả về promise.

#### Vòng đời và các trạng thái của Query

`useQuery` trả về một đối tượng chứa tất cả thông tin về trạng thái của query, cho phép xây dựng giao diện người dùng mạnh mẽ. Các trạng thái này có thể được chia thành hai nhóm chính để hiểu rõ hơn về sự tương tác của chúng [9, 14]:

*   `status` (`'pending'`, `'error'`, `'success'`): Đại diện cho trạng thái của *dữ liệu*. Chúng ta đã có dữ liệu hay chưa?
    *   `isPending`: Query đang chạy lần đầu tiên và chưa có dữ liệu.
    *   `isError`: Query đã gặp lỗi.
    *   `isSuccess`: Query đã thành công và có dữ liệu.
*   `fetchStatus` (`'fetching'`, `'paused'`, `'idle'`): Đại diện cho trạng thái của *`queryFn`*. Hàm này có đang chạy hay không?
    *   `isFetching`: `queryFn` đang được thực thi. Điều này bao gồm cả lần tải đầu tiên và các lần tìm nạp lại trong nền.
    *   `isPaused`: Query muốn tìm nạp nhưng đã bị tạm dừng (ví dụ: do mất kết nối mạng).
    *   `isIdle`: Query không làm gì cả.

Ví dụ, một query có thể ở trạng thái `status: 'success'` (đã có dữ liệu và đang hiển thị) nhưng đồng thời cũng ở trạng thái `fetchStatus: 'fetching'` (đang âm thầm tìm nạp lại dữ liệu mới trong nền).

#### Các tùy chọn Query quan trọng

Ngoài `queryKey` và `queryFn`, `useQuery` cung cấp nhiều tùy chọn mạnh mẽ để tùy chỉnh hành vi:

*   `enabled: boolean`: Cho phép tạo các query phụ thuộc, chỉ chạy một query sau khi một query khác đã hoàn thành thành công. Đây là một mẫu phổ biến trong các ứng dụng di động, ví dụ như tìm nạp chi tiết hồ sơ người dùng sau khi đã tìm nạp ID người dùng.[13, 15]
*   `retry: number | boolean`: Tự động thử lại các yêu cầu thất bại. Có thể cấu hình số lần thử lại hoặc sử dụng thuật toán exponential backoff để xử lý các điều kiện mạng không ổn định.[2, 13]

### 2.2 Cơ chế Caching - Phân tích sâu về `staleTime` và `gcTime`

Cơ chế caching là trái tim của TanStack Query, và việc hiểu rõ hai khái niệm `staleTime` và `gcTime` là chìa khóa để làm chủ thư viện này. Chúng quyết định vòng đời của dữ liệu trong bộ nhớ đệm.

#### Vòng đời dữ liệu

Dữ liệu của một query trải qua bốn giai đoạn riêng biệt: **Fresh → Stale → Inactive → Garbage Collected**.

#### `staleTime` (Thời gian dữ liệu tươi mới)

*   **Mục đích:** Xác định khoảng thời gian mà dữ liệu được coi là "tươi mới" (fresh). Dữ liệu fresh có thể được sử dụng trực tiếp từ bộ nhớ đệm mà không kích hoạt một lần tìm nạp lại tự động trong nền.[13]
*   **Hành vi mặc định:** `staleTime` mặc định là `0` mili giây. Điều này có nghĩa là dữ liệu được coi là "cũ" (stale) ngay sau khi được tìm nạp thành công.[13, 16] Đây là lý do tại sao TanStack Query rất tích cực trong việc giữ cho dữ liệu luôn được cập nhật theo mặc định.
*   **Sử dụng chiến lược:** Đối với dữ liệu ít thay đổi (ví dụ: thông tin hồ sơ người dùng, danh sách danh mục), việc đặt `staleTime` dài hơn (ví dụ: 5 phút) có thể cải thiện đáng kể hiệu suất và giảm số lượng lệnh gọi mạng không cần thiết.

#### `gcTime` (Thời gian thu gom rác)

*   **Mục đích:** Trước đây được gọi là `cacheTime`, `gcTime` (Garbage Collection Time) xác định khoảng thời gian mà dữ liệu của một query *không hoạt động* (inactive - không có hook `useQuery` nào đang được mount) còn tồn tại trong bộ nhớ trước khi bị thu gom rác.[13]
*   **Hành vi mặc định:** Mặc định là 5 phút (`300000ms`). Điều này cung cấp một sự cân bằng tốt, cho phép người dùng điều hướng ra khỏi màn hình và quay lại nhanh chóng mà không cần tải lại từ đầu, nhưng cuối cùng sẽ giải phóng bộ nhớ cho các query không còn được sử dụng.[13, 16]
*   **Mối quan hệ với `staleTime`:** `gcTime` là bộ đếm thời gian để dọn dẹp bộ nhớ của các query *không hoạt động*, trong khi `staleTime` là bộ đếm thời gian cho sự tươi mới của dữ liệu của các query *đang hoạt động*. `gcTime` phải luôn lớn hơn hoặc bằng `staleTime`.

Bảng dưới đây cung cấp một so sánh chi tiết để làm rõ sự khác biệt giữa hai khái niệm này.

| Tính năng | `staleTime` | `gcTime` |
| :--- | :--- | :--- |
| **Vai trò chính** | Kiểm soát sự tươi mới của dữ liệu | Kiểm soát việc dọn dẹp bộ nhớ |
| **Kích hoạt** | Thời gian trôi qua kể từ lần fetch thành công | Thời gian trôi qua kể từ khi query trở nên không hoạt động |
| **Giá trị mặc định** | 0 ms | 5 phút |
| **Hiệu ứng khi hết hạn** | Dữ liệu trở thành "stale" và sẽ được refetch khi có trigger | Dữ liệu bị xóa khỏi bộ nhớ đệm |
| **Áp dụng cho** | Các query đang hoạt động | Các query không hoạt động |
| **Mục tiêu chiến lược** | Cân bằng giữa khả năng phản hồi của UI và sự cập nhật của dữ liệu | Cân bằng giữa hiệu suất và việc sử dụng bộ nhớ |

### 2.3 `useMutation` - Kiến trúc sửa đổi dữ liệu

Trong khi `useQuery` dùng để đọc dữ liệu, `useMutation` là hook chuyên dụng cho bất kỳ hoạt động không đồng bộ nào nhằm sửa đổi dữ liệu trên máy chủ (Tạo, Cập nhật, Xóa).[9, 17, 18]

#### Thực thi Mutations

`useMutation` trả về một đối tượng chứa hàm `mutate` để kích hoạt mutation. Có hai cách để gọi nó:

*   `mutate`: "Fire-and-forget", không trả về promise. Thích hợp cho các tác vụ đơn giản.[17]
*   `mutateAsync`: Trả về một promise, cho phép bạn `await` kết quả và kết hợp các side effect một cách tuần tự.[17, 18]

#### Các Callback trong vòng đời

Sức mạnh thực sự của `useMutation` nằm ở các tùy chọn callback, cho phép điều phối các side effect một cách chính xác [17]:

*   `onSuccess`: Được gọi sau khi mutation thành công.
*   `onError`: Được gọi nếu mutation thất bại.
*   `onSettled`: Được gọi sau khi mutation kết thúc, bất kể thành công hay thất bại.

Các callback này là công cụ chính để thực hiện các tác vụ như hiển thị thông báo, điều hướng người dùng, và quan trọng nhất là vô hiệu hóa các query để kích hoạt việc tìm nạp lại dữ liệu liên quan, đảm bảo giao diện người dùng luôn được đồng bộ.[10, 18]

## Phần 3: Các mẫu nâng cao cho trải nghiệm người dùng vượt trội

Phần này chuyển từ các cơ chế cốt lõi sang các chiến lược nâng cao có tác động trực tiếp đến hiệu suất cảm nhận và khả năng phản hồi của một ứng dụng React Native.

### 3.1 Làm chủ việc vô hiệu hóa Cache để đồng bộ hóa dữ liệu

Sau khi một mutation (ví dụ: tạo một bài đăng mới) thành công, dữ liệu được hiển thị trên các màn hình khác (ví dụ: danh sách bài đăng) sẽ trở nên lỗi thời. TanStack Query cung cấp một cơ chế mạnh mẽ và thanh lịch để giải quyết vấn đề này: vô hiệu hóa cache (cache invalidation).

#### Mô hình Invalidation

`queryClient.invalidateQueries` là phương pháp chính và được khuyến nghị để quản lý đồng bộ hóa dữ liệu sau một mutation.[17, 19, 20]

#### Cách hoạt động

Khi một query bị vô hiệu hóa, nó sẽ được đánh dấu là `stale`. Nếu query đó hiện đang hoạt động trên bất kỳ màn hình nào, nó sẽ tự động được tìm nạp lại trong nền.[20] Điều này đảm bảo giao diện người dùng luôn phản ánh trạng thái mới nhất từ máy chủ mà không cần tải lại toàn bộ trang.

#### Tại sao gọi trong `onSuccess`/`onSettled`

Lý do kiến trúc để gọi `invalidateQueries` bên trong callback `onSuccess` hoặc `onSettled` của một mutation là để đảm bảo tính nhất quán của dữ liệu.[17] Việc này đảm bảo rằng việc tìm nạp lại chỉ xảy ra *sau khi* máy chủ đã xác nhận thành công việc sửa đổi dữ liệu. Điều này ngăn chặn tình huống client tìm nạp lại dữ liệu trước khi thay đổi được áp dụng trên máy chủ, dẫn đến việc hiển thị dữ liệu cũ.

#### Cấu trúc khóa chiến lược

Hiệu quả của việc vô hiệu hóa phụ thuộc rất nhiều vào cách bạn cấu trúc `queryKey`. Một cấu trúc khóa có thứ bậc (ví dụ: `['todos', 'list']`, `['todos', 'detail', 1]`) cho phép vô hiệu hóa một cách chính xác. Bạn có thể vô hiệu hóa tất cả các `todos` (`['todos']`) hoặc chỉ một `todo` cụ thể, ngăn chặn việc tìm nạp lại không cần thiết.[21, 22] Tùy chọn `exact: false` cũng cho phép vô hiệu hóa các nhóm query bắt đầu bằng một khóa nhất định, mang lại sự linh hoạt cao hơn.[22]

### 3.2 Triển khai Optimistic Updates cho giao diện tức thì

Optimistic updates là một kỹ thuật nâng cao trải nghiệm người dùng bằng cách cập nhật giao diện người dùng *trước khi* nhận được xác nhận từ máy chủ, tạo ra cảm giác tương tác không có độ trễ.[3, 23] Đây là một yếu tố thay đổi cuộc chơi cho trải nghiệm người dùng trên di động.

#### Luồng triển khai

Việc triển khai optimistic updates trong TanStack Query tận dụng các callback trong vòng đời của mutation một cách có hệ thống [17, 24]:

1.  **`onMutate`:** Đây là nơi phép màu xảy ra. Trước khi mutation được gửi đi, chúng ta thực hiện các bước sau:
    *   Hủy bỏ bất kỳ query đang chạy nào cho cùng một dữ liệu để ngăn chúng ghi đè lên bản cập nhật lạc quan của chúng ta (`queryClient.cancelQueries`).
    *   Lấy dữ liệu hiện tại từ cache để sử dụng cho việc khôi phục (rollback) nếu có lỗi xảy ra.
    *   Cập nhật thủ công cache với dữ liệu mới, lạc quan bằng cách sử dụng `queryClient.setQueryData`.[10, 24]
    *   Trả về một đối tượng context chứa dữ liệu cũ để `onError` có thể truy cập.

2.  **`onError`:** Nếu mutation thất bại, chúng ta sử dụng context được trả về từ `onMutate` (chứa dữ liệu cũ) để khôi phục cache về trạng thái trước đó, đảm bảo giao diện người dùng phản ánh thực tế.[24, 25]

3.  **`onSettled`:** Bất kể thành công hay thất bại, chúng ta gọi `queryClient.invalidateQueries` ở đây. Đây là bước cuối cùng để đảm bảo trạng thái client hoàn toàn đồng bộ với trạng thái máy chủ, sửa chữa bất kỳ sự khác biệt nào từ bản cập nhật lạc quan.[17, 24]

Việc lựa chọn giữa cache invalidation và optimistic updates là một quyết định chiến lược. Invalidation mang tính "bi quan" nhưng an toàn—giao diện người dùng luôn chính xác, chỉ hơi trễ một chút. Optimistic updates mang tính "lạc quan" và nhanh chóng, nhưng có nguy cơ gây ra một sự khôi phục đột ngột nếu yêu cầu máy chủ thất bại. Đối với các hành động quan trọng, không thể đảo ngược (ví dụ: giao dịch tài chính), sự an toàn của invalidation được ưu tiên. Đối với các hành động rủi ro thấp, thường xuyên (ví dụ: "thích" một bài đăng), phản hồi tức thì của optimistic update mang lại trải nghiệm người dùng vượt trội.

## Phần 4: TanStack Query trong hệ sinh thái React Native

Phần này là cốt lõi của việc tập trung vào React Native, kết nối các tính năng của thư viện trực tiếp với các API của nền tảng và các mẫu giao diện người dùng di động phổ biến.

### 4.1 Infinite Scroll với `FlatList`

Cuộn vô hạn (infinite scrolling) là mẫu phân trang tiêu chuẩn cho thiết bị di động, nơi người dùng cuộn xuống để tải thêm nội dung một cách liền mạch.[26] TanStack Query cung cấp hook `useInfiniteQuery` được thiết kế đặc biệt cho mục đích này.

#### `useInfiniteQuery`

Hook này mở rộng `useQuery` với các tính năng bổ sung để quản lý các danh sách dữ liệu có thể tải thêm [27]:

*   `getNextPageParam`: Một hàm bắt buộc cho bạn biết cách lấy thông tin trang cho lần tìm nạp tiếp theo, thường là từ phản hồi của API (ví dụ: số trang tiếp theo hoặc một con trỏ).[26, 27]
*   `data.pages`: Dữ liệu giờ đây được cấu trúc dưới dạng một mảng các trang. Mảng này cần được làm phẳng (`flat()`) trước khi hiển thị trong `FlatList`.[26, 27]
*   `fetchNextPage`: Hàm để kích hoạt việc tìm nạp trang tiếp theo.
*   `hasNextPage`: Một giá trị boolean cho biết liệu có còn dữ liệu để tải thêm hay không.[26, 27]

#### Tích hợp với `FlatList`

Việc kết hợp `useInfiniteQuery` với component `FlatList` của React Native tạo ra một trải nghiệm cuộn vô hạn mượt mà:

*   Sử dụng prop `onEndReached` của `FlatList` để gọi `fetchNextPage` khi người dùng cuộn đến gần cuối danh sách.[26, 28] Điều này nên được thực hiện bên trong một điều kiện kiểm tra `hasNextPage`.
*   Sử dụng trạng thái `isFetchingNextPage` để hiển thị có điều kiện một chỉ báo tải trong `ListFooterComponent`. Điều này cung cấp phản hồi trực quan cho người dùng rằng dữ liệu mới đang được tải, tạo ra một trải nghiệm liền mạch.[26]

### 4.2 Tích hợp nền tảng thiết yếu cho khả năng phục hồi trên di động

Để một ứng dụng TanStack Query có cảm giác thực sự "bản địa" và linh hoạt, việc tích hợp với các API của nền tảng di động là rất quan trọng. Các tính năng này cho thấy TanStack Query không chỉ "độc lập với nền tảng" mà còn "nhận biết nền tảng", cung cấp các hook để khai thác các sự kiện vòng đời độc nhất của hệ điều hành di động.

#### Quản lý Trực tuyến/Ngoại tuyến

Sử dụng `onlineManager` kết hợp với một thư viện như `@react-native-community/netinfo` để tự động tạm dừng các query khi thiết bị ngoại tuyến và tiếp tục khi có kết nối trở lại. Điều này ngăn chặn một loạt các yêu cầu thất bại và cải thiện trải nghiệm người dùng khi mạng không ổn định.[29]

#### Nhận biết vòng đời ứng dụng

Kết hợp `focusManager` với API `AppState` của React Native để tự động tìm nạp lại các query cũ khi người dùng đưa ứng dụng từ nền lên nền trước. Điều này đảm bảo dữ liệu luôn mới mẻ khi họ quay lại ứng dụng.[29]

#### Tìm nạp dữ liệu nhận biết điều hướng

Đây là một mẫu di động quan trọng. Bằng cách sử dụng hook `useFocusEffect` từ React Navigation, bạn có thể kích hoạt việc tìm nạp lại dữ liệu của một màn hình mỗi khi nó được focus. Đây là một giải pháp thay thế hiệu quả và chi tiết hơn so với việc tìm nạp lại toàn bộ ứng dụng.[29]

#### Tối ưu hóa hiệu suất trên các màn hình không được focus

Tùy chọn `subscribed: isFocused` trên `useQuery`, khi được kết hợp với hook `useIsFocused` của React Navigation, cho phép các query hoàn toàn hủy đăng ký và ngừng nhận cập nhật khi một màn hình không hiển thị. Đây là một kỹ thuật mạnh mẽ để tiết kiệm pin và bộ nhớ trong các ngăn xếp điều hướng phức tạp.[29] Những tính năng này không chỉ là "tiện ích", chúng cần thiết để xây dựng một ứng dụng di động có trách nhiệm, tôn trọng gói dữ liệu và thời lượng pin của người dùng bằng cách tìm nạp dữ liệu một cách thông minh và theo ngữ cảnh.

## Phần 5: Chiến lược sẵn sàng cho sản xuất và kết luận

Phần cuối cùng này cung cấp lời khuyên hữu ích để cấu trúc và gỡ lỗi một ứng dụng quy mô lớn, đồng thời tóm tắt các lập luận chính của báo cáo.

### 5.1 Các phương pháp tốt nhất cho một kiến trúc có thể mở rộng

*   **Cấu trúc Query Keys:** Duy trì một cấu trúc query key nhất quán, có thứ bậc là rất quan trọng. Việc tạo ra một "nhà máy query key" (query key factory) tập trung giúp tránh các chuỗi ma thuật (magic strings), đảm bảo an toàn kiểu chữ (type safety) và làm cho việc vô hiệu hóa cache trở nên dễ đoán hơn.[21]
*   **Custom Hooks:** Một phương pháp mạnh mẽ là đóng gói các lệnh gọi `useQuery` và `useMutation` bên trong các custom hook (ví dụ: `useTodos`, `useAddTodo`). Điều này thúc đẩy khả năng tái sử dụng, tách biệt logic dữ liệu khỏi các component giao diện người dùng, và làm cho mã nguồn dễ bảo trì và kiểm thử hơn.[11]

### 5.2 Gỡ lỗi và phát triển trong React Native

Mặc dù DevTools tích hợp của TanStack Query chủ yếu hỗ trợ React DOM, hệ sinh thái React Native cung cấp các giải pháp thay thế mạnh mẽ. Có các tích hợp của bên thứ ba với các công cụ gỡ lỗi phổ biến như Flipper và Reactotron.[7, 29] Các công cụ này không thể thiếu để kiểm tra bộ nhớ đệm của query, theo dõi trạng thái của các mutation và gỡ lỗi các vấn đề về luồng dữ liệu trong môi trường di động.

### 5.3 Kết luận: Lựa chọn dứt khoát cho React Native

Báo cáo này đã chứng minh rằng TanStack Query không chỉ là một sự thay thế cho `fetch` + `useEffect`; nó là một sự thay đổi trong tư duy giúp giải quyết những phức tạp cố hữu của việc quản lý server state. Bằng cách cung cấp một cơ chế caching mạnh mẽ, các API khai báo và tích hợp sâu với hệ sinh thái React Native, nó trao quyền cho các nhà phát triển để xây dựng các ứng dụng di động nhanh hơn, linh hoạt hơn và tinh vi hơn với ít mã nguồn và ít lỗi hơn đáng kể. Nó cho phép bạn kiểm soát dữ liệu ứng dụng của mình trước khi nó bắt đầu kiểm soát bạn.[5, 8]