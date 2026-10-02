import type { Product, Shop } from "@/types";

/**
 * Curated photography (Unsplash CDN). Every product resolves by keyword against
 * its name/brand, falling back to its category — and every image renders through
 * <SmartImage>, which degrades to a clean placeholder if a URL ever 404s.
 */

const U = (id: string, w = 480) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const CATEGORY_IMAGES: Record<string, string> = {
  all: U("photo-1542838132-92c53300491e"),
  Grocery: U("photo-1542838132-92c53300491e"),
  "Dairy & Bakery": U("photo-1550583724-b2692b85b150"),
  "Fruits & Vegetables": U("photo-1512621776951-a57141f2eefd"),
  Snacks: U("photo-1566478989037-eec170784d0b"),
  Beverages: U("photo-1554866585-cd94860890b7"),
  "Personal Care": U("photo-1556228720-195a672e8a03"),
  Household: U("photo-1585421514738-01798e348b17"),
  Stationery: U("photo-1456735190827-d1262f71b8a3"),
  Electronics: U("photo-1519389950473-47ba0277781c"),
};

const BY_KEYWORD: [RegExp, string][] = [
  [/taaza|gold milk|amul gold/i, U("photo-1550583724-b2692b85b150")],
  [/lassi|chaas|buttermilk/i, U("photo-1571212515416-fef01fc43637")],
  [/shrikhand|ice cream/i, U("photo-1501443762994-82bd5dace89a")],
  [/butter/i, U("photo-1589985270826-4b7bb135bc9d")],
  [/paneer|cheese/i, U("photo-1452195100486-9cc805987862")],
  [/bread|pav/i, U("photo-1509440159596-0249088772ff")],
  [/croissant|muffin|donut|bakery/i, U("photo-1555507036-ab1f4038808a")],
  [/egg/i, U("photo-1582722872445-44dc5f7e3c8f")],
  [/atta|maida|sooji|besan|flour|poha/i, U("photo-1622480916113-9000ac49b79d")],
  [/rice|kolam|basmati/i, U("photo-1586201375761-83865001e31c")],
  [/dal|rajma|moong|toor|chana/i, U("photo-1615485500704-8e990f9900f7")],
  [/salt/i, U("photo-1518110925495-5fe2fda0442c")],
  [/garam masala|turmeric|cardamom|pepper|cumin|mustard|spice|masala/i, U("photo-1596040033229-a9821ebd058d")],
  [/oil|fortune/i, U("photo-1474979266404-7eaacbcd87c5")],
  [/tea|tata tea/i, U("photo-1597318181409-cf64d0b5d8a2")],
  [/coffee|nescafe/i, U("photo-1447933601403-0c6688de566e")],
  [/bournvita|chocolate|cadbury/i, U("photo-1606312619070-d48b4c652a52")],
  [/maggi|noodle/i, U("photo-1612929633738-8fe44f7ec841")],
  [/jaggery|gulab|kheer|dessert mix/i, U("photo-1571167530149-c72f2b6b4a83")],
  [/sabudana|sago/i, U("photo-1622480916113-9000ac49b79d")],
  [/tomato/i, U("photo-1546094096-0df4bcaaa337")],
  [/onion/i, U("photo-1580201092675-a0a6a6cafbb1")],
  [/potato/i, U("photo-1518977676601-b53f82aba655")],
  [/carrot/i, U("photo-1445282768818-728615cc910a")],
  [/capsicum|cucumber|lauki/i, U("photo-1567375698348-5d9d5ae99de0")],
  [/spinach|palak|coriander|leaf|herb/i, U("photo-1576045057995-568f588f82fb")],
  [/lemon|lime/i, U("photo-1531315630201-bb15abeb1653")],
  [/chilli/i, U("photo-1583258292688-d0213dc5a3a8")],
  [/banana/i, U("photo-1571771894821-ce9b6c11b08e")],
  [/apple/i, U("photo-1560806887-1e4cd0b6cbd6")],
  [/orange/i, U("photo-1547514701-42782101795e")],
  [/grape/i, U("photo-1537640538966-79f369143f8f")],
  [/watermelon|melon/i, U("photo-1587049352846-4a222e784d38")],
  [/mango/i, U("photo-1553279768-865429fa0078")],
  [/ginger|garlic/i, U("photo-1615485290382-441e4d049cb5")],
  [/vegetable|veggie|farm/i, U("photo-1512621776951-a57141f2eefd")],
  [/cola|thums|pepsi|dew|cold drink|soft drink/i, U("photo-1554866585-cd94860890b7")],
  [/bisleri|water/i, U("photo-1560023907-5f339617ea30")],
  [/juice|real/i, U("photo-1600271886742-f049cd451bba")],
  [/biscuit|cookie|good day|parle/i, U("photo-1499636136210-6f4ee915583e")],
  [/kurkure|lays|chips|namkeen|bhujia|haldiram/i, U("photo-1566478989037-eec170784d0b")],
  [/surf|rin|ariel|detergent|comfort/i, U("photo-1610557892470-55d9e80c0bce")],
  [/vim|harpic|lizol|scotch|scrub|clean/i, U("photo-1585421514738-01798e348b17")],
  [/mop|broom|bucket/i, U("photo-1584820927498-cfe5211fd8bf")],
  [/soap|dove|lifebuoy|godrej|santoor|fiama/i, U("photo-1600857544200-b2f666a9a2ec")],
  [/shampoo|clinic|pantene|head/i, U("photo-1631730486572-226d1f595b68")],
  [/colgate|tooth/i, U("photo-1607613009820-a29f7bb81c04")],
  [/nivea|cream|lotion|talc/i, U("photo-1556228720-195a672e8a03")],
  [/gillette|shave|razor/i, U("photo-1621607512214-68297480165e")],
  [/whisper|sanitary/i, U("photo-1584515933487-779824d29309")],
  [/odonil|freshener/i, U("photo-1602872030219-ad2b9a54315c")],
  [/notebook|classmate/i, U("photo-1531346878377-a5be20888e57")],
  [/pen|reynolds|cello|whitener/i, U("photo-1585336261022-680e295ce3fe")],
  [/pencil|apsara|natraj|eraser|sharpener/i, U("photo-1596464716127-f2a82984de30")],
  [/sketch|camlin|crayon/i, U("photo-1596464716127-f2a82984de30")],
  [/geometry|scale|ruler/i, U("photo-1456735190827-d1262f71b8a3")],
  [/fevicol|glue|tape|stapler|clip/i, U("photo-1583485088034-697b5bc54ccd")],
  [/sticky note|a4|paper ream/i, U("photo-1531346878377-a5be20888e57")],
  [/boat|earphone|headphone|rockerz/i, U("photo-1590658268037-6bf12165a8df")],
  [/charger|adapter/i, U("photo-1583863788434-e58a36330cf0")],
  [/cable|otg/i, U("photo-1583863788434-e58a36330cf0")],
  [/power bank|mi power/i, U("photo-1609091839311-d5365f9ff1c5")],
  [/jbl|speaker/i, U("photo-1608043152269-423dbba4e7e1")],
  [/memory card|sandisk/i, U("photo-1591488320449-011701bb6704")],
  [/tempered|cover|screen/i, U("photo-1511707171634-5f897ff02aa9")],
  [/wipe/i, U("photo-1585421514738-01798e348b17")],
];

const SHOP_IMAGES: Record<string, string> = {
  sharma: U("photo-1542838132-92c53300491e", 640),
  balaji: U("photo-1568254183919-78a4f43a2877", 640),
  freshcorner: U("photo-1592924357228-91a4daadcfea", 640),
  satyam: U("photo-1604719312566-8912e9227c6a", 640),
  shreeji: U("photo-1583258292688-d0213dc5a3a8", 640),
  patel: U("photo-1456735190827-d1262f71b8a3", 640),
  rapid: U("photo-1511707171634-5f897ff02aa9", 640),
  gujarat: U("photo-1550989460-0adf9ea622e2", 640),
};

export function productImage(p: Pick<Product, "name" | "brand" | "category">): string {
  for (const [re, url] of BY_KEYWORD) if (re.test(p.name) || re.test(p.brand)) return url;
  return CATEGORY_IMAGES[p.category] ?? CATEGORY_IMAGES.all;
}

export function shopImage(shop: Pick<Shop, "id" | "type">): string {
  return SHOP_IMAGES[shop.id] ?? CATEGORY_IMAGES.all;
}

export function heroCollage() {
  return {
    milk: U("photo-1550583724-b2692b85b150", 640),
    veggies: U("photo-1512621776951-a57141f2eefd", 640),
    rider: U("photo-1526367790999-0150786686a2", 720),
    storefront: U("photo-1591085686350-798c0f9faa7f", 720),
    fruits: U("photo-1610832958506-aa56368176cf", 640),
  };
}
