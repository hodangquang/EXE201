from pathlib import Path
root = Path('D:/EXE201')
def edit(name, old, new):
    p=root/name; s=p.read_text(encoding='utf-8-sig')
    assert old in s, (name,old[:100])
    p.write_text(s.replace(old,new),encoding='utf-8')
def cut(name, start, end, replacement):
    p=root/name; s=p.read_text(encoding='utf-8-sig')
    a=s.index(start); b=s.index(end,a)
    p.write_text(s[:a]+replacement+s[b:],encoding='utf-8')

# Retain old routes as explicit rejections for older clients; no stock/data mutation.
ops='Rewear_BackEnd/REWEAR.Application/Services/CircularFashionService.cs'
cut(ops,'    public Task<QualityInspection> InspectInventoryAsync(', '    public Task<Product> PublishResaleAsync(string id, decimal', '''    public async Task<QualityInspection> InspectInventoryAsync(string id, QualityDecisionRequest request, string actor)
    {
        await Operator(actor);
        throw new InvalidOperationException("REWEAR chỉ tái chế. Hãy tạo dự án từ nguyên liệu và kiểm định thành phẩm của dự án.");
    }

    public async Task<Product> PublishResaleAsync(string id, PublishResaleRequest request, string actor)
    {
        await Operator(actor);
        throw new InvalidOperationException("REWEAR đã ngừng bán lại đồ nguyên trạng. Chỉ đăng bán thành phẩm từ dự án tái chế đã đạt QC.");
    }

''')
# Legacy raw items previously QC'd for resale remain usable as material, without rewriting history.
edit(ops,'item.State != "AvailableRaw" || await store.GetAsync<PurchasePayout>(item.SourcingId) == null', 'item.State is not ("AvailableRaw" or "QCApproved" or "Rework") || item.ProjectId != null || item.ProductId != null || await store.GetAsync<PurchasePayout>(item.SourcingId) == null')
ps='Rewear_BackEnd/REWEAR.Application/Services/ProductService.cs'
cut(ps,'    public async Task<ProductResponse> CreateAsync(', '    /// <summary>\n    /// Cập nhật sản phẩm.', '''    public Task<ProductResponse> CreateAsync(CreateProductRequest request) =>
        Task.FromException<ProductResponse>(new InvalidOperationException("Hãy đăng bán thành phẩm từ dự án tái chế đã đạt QC."));

''')
cut(ps,'    public async Task<ProductResponse?> ActivatePreviewAsync(', '    private async Task<string> GenerateUniqueSlug', '''    public Task<ProductResponse?> ActivatePreviewAsync(string id, ProductCondition condition, string actorId) =>
        Task.FromException<ProductResponse?>(new InvalidOperationException("Bản xem trước chỉ là ý tưởng. Hãy tạo dự án tái chế, hoàn thiện và kiểm định thành phẩm trước khi đăng bán."));

''')
pc='Rewear_BackEnd/REWEAR.API/Controllers/ProductsController.cs'
edit(pc,'            return Ok(products);','            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))\n                products = products.Where(p => p.ProductType == "Upcycled").ToList();\n            return Ok(products);')
edit(pc,'(!product.IsActive && !User.IsInRole("Admin") && !User.IsInRole("Staff"))','((!product.IsActive || product.ProductType != "Upcycled") && !User.IsInRole("Admin") && !User.IsInRole("Staff"))')
# Reject before image upload, avoiding external uploads for a disabled operation.
cut(pc,'    public async Task<IActionResult> Create(', '    /// <summary>\n    /// Cập nhật', '''    public IActionResult Create([FromForm] CreateProductFormRequest request) =>
        Conflict(new { message = "Hãy đăng bán thành phẩm từ dự án tái chế đã đạt QC." });

''')
cart='Rewear_BackEnd/REWEAR.Application/Services/CartService.cs'
edit(cart,'        if (!product.IsActive)\n            return Fail', '        if (product.ProductType != "Upcycled")\n            return Fail("REWEAR chỉ kinh doanh sản phẩm tái chế. Món đồ này không còn được mở bán.");\n\n        if (!product.IsActive)\n            return Fail')
edit(cart,'product == null || !product.IsActive || product.IsPreview', 'product == null || product.ProductType != "Upcycled" || !product.IsActive || product.IsPreview')
edit(cart,'product != null && product.IsActive && product.Status', 'product != null && product.ProductType == "Upcycled" && product.IsActive && !product.IsPreview && product.Status')
edit(cart,'            if (!product.IsActive)\n', '            if (product.ProductType != "Upcycled")\n            {\n                isAvailable = false;\n                unavailableReason = "REWEAR chỉ kinh doanh sản phẩm tái chế.";\n            }\n            else if (!product.IsActive)\n')
edit('Rewear_BackEnd/REWEAR.Application/Services/OrderService.cs','!product.IsActive || product.IsPreview', 'product.ProductType != "Upcycled" || !product.IsActive || product.IsPreview')
repo='Rewear_BackEnd/REWEAR.Infrastructure/Repositories/ProductRepository.cs'
edit(repo,'product == null || !product.IsActive || product.IsPreview','product == null || product.ProductType != "Upcycled" || !product.IsActive || product.IsPreview')
edit(repo,'p.Id == productId && p.Status == ProductStatus.Available && p.IsActive && !p.IsPreview','p.Id == productId && p.ProductType == "Upcycled" && p.Status == ProductStatus.Available && p.IsActive && !p.IsPreview')
edit('Rewear_BackEnd/REWEAR.Infrastructure/Services/ProductJourneyQuery.cs','if (product == null || !product.GetValue("isActive", false).ToBoolean())', 'if (product == null || Text(product, "ProductType") != "Upcycled" || !product.GetValue("isActive", false).ToBoolean())')
edit('Rewear_BackEnd/REWEAR.Infrastructure/Services/StyleWatchService.cs','p.IsActive && !p.IsPreview && p.IsUnique', 'p.ProductType == "Upcycled" && p.IsActive && !p.IsPreview && p.IsUnique')
edit('Rewear_BackEnd/REWEAR.Infrastructure/Services/StyleWatchService.cs','// A periodic scan covers all publication paths (direct create, preview activation, resale and upcycling).','// Only published upcycled products participate in new style alerts.')

ui='src/pages/Operations/OperationsPage.jsx'
edit(ui,'Modal, Radio, Select','Modal, Select')
edit(ui,"  qc: 'Kiểm định thành phẩm (Upcycling)',", "  qc: 'Kiểm định thành phẩm tái chế',")
edit(ui,"  publish: 'Đăng bán thành phẩm (Upcycling)',", "  publish: 'Đăng bán thành phẩm tái chế',")
edit(ui,"  qcInventory: 'Nghiệm thu QC trước khi bán (Resale)',\n  publishResale: 'Đăng bán sản phẩm Second-hand (Resale)',\n",'')
edit(ui,"  const [qcTab, setQcTab] = useState('projects'); // 'projects' | 'inventory'\n",'')
edit(ui,"mode === 'inventory' || (mode === 'qc' && qcTab === 'inventory') || (!mode && data.inventory.some(i => i.id === recordId))", "mode === 'inventory'")
edit(ui,'[mode, qcTab, data.inventory]','[mode, data.inventory]')
cut(ui,"    if (action?.type === 'qcInventory'",'    setBusy(true);','')
edit(ui,"      if (action.type === 'qcInventory') await operationsApi.inspectInventory(recordId, { ...values, images: uploaded });\n      if (action.type === 'publishResale') await operationsApi.publishResale(recordId, values);\n",'')
edit(ui,"inventoryMode || (qcMode && qcTab === 'inventory')",'inventoryMode')
cut(ui,'    if (qcMode) {','    if (filter && row.state', "    if (qcMode && !['QualityCheck', 'QCApproved', 'Rework', 'Completed'].includes(row.state)) return false;\n")
cut(ui,"        {row.state === 'AvailableRaw'", "        {row.state === 'ReturnToSenderPending'", '''        {['AvailableRaw', 'QCApproved', 'Rework'].includes(row.state) && !row.projectId && !row.productId &&
          <Button type="primary" size="small" onClick={() => navigate(`/upcycling?inventory=${row.id}&title=${encodeURIComponent(row.title)}`)}>Tạo dự án tái chế</Button>}
''')
edit(ui,'Kiểm định chất lượng thành phẩm Upcycling và hiện vật Resale trước khi mở bán.','Kiểm định chất lượng thành phẩm tái chế trước khi mở bán.')
cut(ui,'      {qcMode && (','      <Space wrap style={{ marginBottom: 20 }}>','')
cut(ui,"        {action?.type === 'qcInventory'", "        {action?.type === 'returnSource'",'')
edit(ui,"data.inventory.filter(i => i.state === 'AvailableRaw')", "data.inventory.filter(i => ['AvailableRaw', 'QCApproved', 'Rework'].includes(i.state) && !i.projectId && !i.productId)")
svc='src/services/operations.js'
cut(svc,'  inspectInventory:', '\n};','')
sr='src/pages/Collections/SourcingRequests.jsx'
edit(sr,'              <Button type="primary" size="small" onClick={() => navigate(\'/inventory\')}>Kiểm định QC tại kho</Button>\n','')
edit(sr,'Chuyển Upcycling','Tạo dự án tái chế')
edit(sr,'Cửa hàng đã ghi nhận chi trả. Đồ bán lại cần có ảnh hiện vật và kết quả QC đạt trước khi đăng bán; đồ tái chế cần kiểm định thành phẩm sau khi hoàn thiện.','Cửa hàng đã ghi nhận chi trả. Đồ thu mua được dùng làm nguyên liệu cho dự án tái chế; thành phẩm phải đạt kiểm định trước khi đăng bán.')
edit(sr,'                  <Button type="primary" icon={<ShoppingBag size={14} />} onClick={() => navigate(\'/inventory\')}>Kiểm định QC tại kho</Button>\n','')
edit(sr,'Tạo dự án Upcycling','Tạo dự án tái chế')
hook='src/hooks/usePublicProducts.js'
edit(hook,"return status === 0 || status === '0' || status === 'Available';", "return readProductField(product, 'productType') === 'Upcycled' && (status === 0 || status === '0' || status === 'Available');")
edit(hook,"setProduct(mapApiProductToStoreProduct(response.data ?? response));", "{ const data = response.data ?? response; setProduct(readProductField(data, 'productType') === 'Upcycled' ? mapApiProductToStoreProduct(data) : null); }")
edit('src/pages/Store/StoreProductPage.jsx',"product.productType === 'Upcycled' ? 'Tái chế sáng tạo' : 'Đồ bán lại'", "'Tái chế sáng tạo'")
edit('src/routes/AppRoutes.jsx','path="/products/new" element={<ProductForm />}','path="/products/new" element={<Navigate to="/upcycling" replace />}')
edit('src/pages/Products/ProductList.jsx',"navigate('/products/new')", "navigate('/upcycling')")
edit('src/pages/Products/ProductList.jsx','Thêm sản phẩm mới','Tạo sản phẩm từ dự án tái chế')
edit('src/pages/Products/ProductList.jsx','Kiểm tra tình trạng và đăng bán','Chỉnh sửa bản xem trước')
pf='src/pages/Products/ProductForm.jsx'
cut(pf,'  const handleActivate = async () => {','  const handleUploadChange','')
cut(pf,'            {isEdit && isPreview && (','            {!isEdit && (','''            {isEdit && isPreview && <div className="flat-card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="editorial-sub" style={{ marginBottom: 12 }}>Ý TƯỞNG TÁI CHẾ</div>
              <p>Bản xem trước chưa phải thành phẩm được kiểm định. Tạo dự án từ nguyên liệu đã thu mua, hoàn thiện và kiểm định thành phẩm để đăng bán.</p>
              <button type="button" className="pill-btn-filled" onClick={() => navigate('/upcycling')}>Đến dự án tái chế</button>
            </div>}
''')
draft='src/pages/Products/CatalogDrafts.jsx'
edit(draft,"  { value: 'SecondHand', label: 'Bán lại' },\n",'')
edit(draft,"product.productType === 'Upcycled' ? 'Tái chế sáng tạo' : 'Bán lại'", "'Tái chế sáng tạo'")
edit(draft,'setCatalog(data);', "setCatalog({ ...data, products: data.products.filter(product => product.productType === 'Upcycled') });")
edit(draft,'Nội dung và bộ ảnh dùng để chuẩn bị sáu mẫu sản phẩm. Trạng thái bán hiện tại được quản lý ở Danh sách sản phẩm.','Nội dung và bộ ảnh lưu các ý tưởng sản phẩm tái chế. Trạng thái bán hiện tại được quản lý ở Danh sách sản phẩm.')
edit(draft,'Sáu mẫu đã có trong Danh sách sản phẩm. Trang này chỉ giữ nội dung đề xuất ban đầu, không cập nhật theo API. Để đăng bán một món đang chờ, quay lại Danh sách sản phẩm, kiểm tra tình trạng rồi bấm Đăng bán 1 món.','Trang này chỉ giữ ý tưởng tái chế ban đầu, không cập nhật theo API. Đăng bán thành phẩm từ dự án tái chế đã hoàn thiện và đạt kiểm định.')
edit(draft,'<p><strong>06</strong> mẫu trong bản lưu</p><p><strong>02</strong> mẫu có ảnh nguyên liệu</p><p><strong>04</strong> mẫu bán lại</p>', '<p><strong>{catalog.products.length}</strong> ý tưởng tái chế</p><p><strong>{catalog.products.filter(product => product.beforeImages?.length).length}</strong> mẫu có ảnh nguyên liệu</p>')
edit(draft,'Với món “Sắp mở bán”, kiểm tra hiện vật và chọn tình trạng trước khi đăng bán.','Tạo dự án tái chế và kiểm định thành phẩm trước khi đăng bán.')
edit(draft,"        {selected.productType === 'SecondHand' && <p>Thương hiệu, thành phần vải và tình trạng thực tế cần bổ sung sau khi kiểm tra hiện vật.</p>}\n",'')
edit('src/pages/About/AboutPage.jsx','qua việc chọn lại, tái sử dụng và tìm cảm hứng thiết kế mới.','qua việc thu gom nguyên liệu, tái chế và tạo nên thiết kế mới.')
