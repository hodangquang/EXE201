const fs=require('fs');
for(const p of ['context/recycling-only-2026-10-27.md','context/CHANGELOG.md','tools/qa/README.md']){
 let s=fs.readFileSync(p,'utf8');
 s=s.replace('**42 lượt đạt, không có lỗi JavaScript**','**43 lượt đạt (42 tổng thể + 1 ghi chi phí), không có lỗi JavaScript**').replace('Chrome fixture 42 lượt đạt','Chrome fixture 43 lượt đạt (42 tổng thể + 1 ghi chi phí)').replace('Đã đạt 42 lượt, không có lỗi JavaScript.','Đã đạt 43 lượt (42 tổng thể + 1 ghi chi phí), không có lỗi JavaScript.');
 if(p.includes('recycling-only-2026'))s=s.replace('## Bằng chứng kiểm tra','Bổ sung hàm operationsApi.addCost còn thiếu để gửi POST /api/operations/projects/{id}/costs. Backend endpoint này đã có; browser fixture xác nhận form gửi đúng route và chỉ báo lưu sau response thành công.\n\n## Bằng chứng kiểm tra').replace('Kết quả/screenshot tại .artifacts/recycling-only/browser/.','Kết quả/screenshot tại .artifacts/recycling-only/browser/ và browser-cost/.');
 fs.writeFileSync(p,s);
}
