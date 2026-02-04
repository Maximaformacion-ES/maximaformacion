// Font Assets - ZTNature family
const fonts = {
  thin: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913986674-017964fb/ZTNature-Thin.otf",
  thinItalic: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913986920-862837aa/ZTNature-ThinItalic.otf",
  light: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913985249-0128a438/ZTNature-Light.otf",
  regular: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913986069-dc06bf70/ZTNature-Regular.otf",
  medium: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913985652-29587513/ZTNature-Medium.otf",
  bold: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913983676-967d809c/ZTNature-Bold.otf",
  black: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913983263-9b7f6108/ZTNature-Black.otf",
  blackItalic: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/4aed2f49-a476-436f-bae8-f31aa18f46fa/1767913983475-0ede7721/ZTNature-BlackItalic.otf"
};

export const FontStyles = () => (
  <style>{`
    @font-face { font-family: 'ZTNature'; src: url('${fonts.thin}') format('opentype'); font-weight: 100; font-style: normal; font-display: swap; }
    @font-face { font-family: 'ZTNature'; src: url('${fonts.thinItalic}') format('opentype'); font-weight: 100; font-style: italic; font-display: swap; }
    @font-face { font-family: 'ZTNature'; src: url('${fonts.light}') format('opentype'); font-weight: 300; font-style: normal; font-display: swap; }
    @font-face { font-family: 'ZTNature'; src: url('${fonts.regular}') format('opentype'); font-weight: 400; font-style: normal; font-display: swap; }
    @font-face { font-family: 'ZTNature'; src: url('${fonts.medium}') format('opentype'); font-weight: 500; font-style: normal; font-display: swap; }
    @font-face { font-family: 'ZTNature'; src: url('${fonts.bold}') format('opentype'); font-weight: 700; font-style: normal; font-display: swap; }
    @font-face { font-family: 'ZTNature'; src: url('${fonts.black}') format('opentype'); font-weight: 900; font-style: normal; font-display: swap; }
    @font-face { font-family: 'ZTNature'; src: url('${fonts.blackItalic}') format('opentype'); font-weight: 900; font-style: italic; font-display: swap; }
    
    * { font-family: 'ZTNature', system-ui, sans-serif; }
  `}</style>
);
