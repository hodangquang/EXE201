const fs=require('fs');
function edit(file,fn){const s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');fs.writeFileSync(file,fn(s));}
function cut(s,start,end,replacement=''){const a=s.indexOf(start),b=s.indexOf(end,a);if(a<0||b<0)throw Error(start);return s.slice(0,a)+replacement+s.slice(b);}
edit('Rewear_BackEnd/REWEAR.Application/Services/CartService.cs',s=>s.replace('                isAvailable = false;\n',''));
edit('src/pages/Collections/SourcingRequests.jsx',s=>s.replace('Scissors, ShoppingBag,','Scissors,'));
edit('src/pages/Products/ProductForm.jsx',s=>{
 s=s.replace('message, Upload','message').replace('ArrowLeft, Sparkles, Upload as UploadIcon','ArrowLeft, Sparkles');
 s=s.replace("  const [fileList, setFileList] = useState([]);\n",'');
 s=cut(s,'  const onFinish = async (values) => {','  return (',`  const onFinish = async values => {
    try {
      setLoading(true);
      await saveEdits(values);
      message.success('Đã cập nhật thông tin sản phẩm.');
      navigate('/products');
    } catch (error) {
      message.error(error.message || 'Không cập nhật được sản phẩm.');
    } finally { setLoading(false); }
  };

`);
 s=cut(s,'            {!isEdit && (',"            <div style={{ display: 'flex', gap: '12px' }}>");
 return s;
});
edit('public/catalog/rewear-drafts.json',s=>{const data=JSON.parse(s);data.products=data.products.filter(p=>p.productType==='Upcycled');data.collectionId='rewear-upcycled-ideas-2026-10-27';return JSON.stringify(data,null,2)+'\n';});
edit('Rewear_BackEnd/REWEAR.Tests/CommerceTests.cs',s=>s.replace('Title = "Test unique item",','ProductType = "Upcycled", Title = "Test unique item",'));
edit('Rewear_BackEnd/REWEAR.Tests/StyleWatchTests.cs',s=>s.replaceAll('new Product {','new Product { ProductType = "Upcycled",'));
edit('Rewear_BackEnd/REWEAR.Tests/CircularFashionTests.cs',s=>cut(s,'    [Test]\n    public async Task ResaleNeedsPassedQcWithActualPhotosAndCannotChangeInspectedCondition()', '    [Test]\n    public async Task PickupAndWarehouseReceipt',`    [Test]
    public async Task PaidSourceCannotUseLegacyResaleAndRemainsAvailableForRecycling()
    {
        var f = await SourceFixture();
        Assert.ThrowsAsync<InvalidOperationException>(() => f.Ops.InspectInventoryAsync(f.Source.Id,
            new() { Passed = true, Note = "Fixture QC", Images = ["https://example.test/qc.jpg"] }, f.Staff.Id));
        Assert.ThrowsAsync<InvalidOperationException>(() => f.Ops.PublishResaleAsync(f.Source.Id, 299000, f.Staff.Id));
        Assert.ThrowsAsync<InvalidOperationException>(() => f.Sourcing.ConvertToProductAsync(f.Source.Id,
            new() { SellingPrice = 299000 }, f.Staff.Id));
        Assert.That((await f.Ops.InventoryAsync()).Single().State, Is.EqualTo("AvailableRaw"));
        Assert.That(await Products.GetAllAsync(), Is.Empty);
        var project = await f.Ops.CreateProjectAsync(new() { Title = "Fixture recycle", Concept = "Transform material",
            InventoryIds = [f.Source.Id], ResponsibleStaffId = f.Staff.Id }, f.Staff.Id);
        Assert.That(project.InventoryIds, Is.EqualTo(new[] { f.Source.Id }));
    }

`));
edit('Rewear_BackEnd/REWEAR.Tests/CatalogReplacementTests.cs',s=>{
 s=cut(s,'    [Test]\n    public async Task ConfirmedUniquePreviewBecomesPurchasableWithOneItem()', '    [Test]\n    public async Task ProductWithActiveOrderReservationCannotBeHidden()',`    [TestCase("Upcycled")]
    [TestCase("SecondHand")]
    public async Task PreviewCannotBypassRecyclingProjectQc(string type)
    {
        var product = await Product(); product.ProductType = type; product.IsPreview = true; product.StockQuantity = 0;
        await Products.UpdateAsync(product);
        var service = new ProductService(Products, new BrandRepository(Context), new CategoryRepository(Context), new SourcingRepository(Context));
        Assert.ThrowsAsync<InvalidOperationException>(() => service.ActivatePreviewAsync(product.Id, ProductCondition.Good, "fixture-admin"));
        var stored = (await Products.GetByIdAsync(product.Id))!;
        Assert.That(stored.IsPreview, Is.True); Assert.That(stored.StockQuantity, Is.Zero);
        Assert.That(stored.ProductType, Is.EqualTo(type));
    }

    [Test]
    public void DirectCreationCannotBypassRecyclingProjectQc()
    {
        var service = new ProductService(Products, new BrandRepository(Context), new CategoryRepository(Context), new SourcingRepository(Context));
        Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateAsync(new() { Title = "Fixture", Price = 100000 }));
    }

`);
 s=s.replace('Assert.That((await new ProductJourneyQuery(Context).GetAsync(product.Id))!.BeforeImages, Is.Empty);','Assert.That(await new ProductJourneyQuery(Context).GetAsync(product.Id), Is.Null);');
 return s;
});
