/**
 * West Bengal BL&LRO Office District & Block Code Directory
 * Used for automatic mutation application prefix: MUTE/<YEAR>/<BLLRO_CODE>/<SERIAL>
 */

export interface BllroBlock {
  name: string;
  bnName: string;
  code: string; // e.g. "1603"
  officeName: string;
}

export interface BllroDistrict {
  id: string;
  name: string;
  bnName: string;
  distCode: string; // 2-digit district code, e.g. "16"
  blocks: BllroBlock[];
}

export const WB_BLLRO_DISTRICTS: BllroDistrict[] = [
  {
    id: 's24p',
    name: 'South 24 Parganas',
    bnName: 'দক্ষিণ ২৪ পরগণা',
    distCode: '16',
    blocks: [
      { name: 'Baruipur', bnName: 'বারুইপুর', code: '1603', officeName: 'Office of the BL&LRO, Baruipur' },
      { name: 'Sonarpur', bnName: 'সোনারপুর', code: '1606', officeName: 'Office of the BL&LRO, Sonarpur' },
      { name: 'Bhangar-I', bnName: 'ভাঙড়-১', code: '1607', officeName: 'Office of the BL&LRO, Bhangar-I' },
      { name: 'Bhangar-II', bnName: 'ভাঙড়-২', code: '1608', officeName: 'Office of the BL&LRO, Bhangar-II' },
      { name: 'Canning-I', bnName: 'ক্যানিং-১', code: '1601', officeName: 'Office of the BL&LRO, Canning-I' },
      { name: 'Canning-II', bnName: 'ক্যানিং-২', code: '1602', officeName: 'Office of the BL&LRO, Canning-II' },
      { name: 'Joynagar-I', bnName: 'জয়নগর-১', code: '1604', officeName: 'Office of the BL&LRO, Joynagar-I' },
      { name: 'Joynagar-II', bnName: 'জয়নগর-২', code: '1605', officeName: 'Office of the BL&LRO, Joynagar-II' },
      { name: 'Basanti', bnName: 'বাসন্তী', code: '1609', officeName: 'Office of the BL&LRO, Basanti' },
      { name: 'Gosaba', bnName: 'গোসাবা', code: '1610', officeName: 'Office of the BL&LRO, Gosaba' },
      { name: 'Kultali', bnName: 'কুলতলী', code: '1611', officeName: 'Office of the BL&LRO, Kultali' },
      { name: 'Magrahat-I', bnName: 'মগরাহাট-১', code: '1612', officeName: 'Office of the BL&LRO, Magrahat-I' },
      { name: 'Magrahat-II', bnName: 'মগরাহাট-২', code: '1613', officeName: 'Office of the BL&LRO, Magrahat-II' },
      { name: 'Diamond Harbour-I', bnName: 'ডায়মন্ড হারবার-১', code: '1614', officeName: 'Office of the BL&LRO, Diamond Harbour-I' },
      { name: 'Diamond Harbour-II', bnName: 'ডায়মন্ড হারবার-২', code: '1615', officeName: 'Office of the BL&LRO, Diamond Harbour-II' },
      { name: 'Falta', bnName: 'ফলতা', code: '1616', officeName: 'Office of the BL&LRO, Falta' },
      { name: 'Kulpi', bnName: 'কুলপী', code: '1617', officeName: 'Office of the BL&LRO, Kulpi' },
      { name: 'Mandirbazar', bnName: 'মন্দিরবাজার', code: '1618', officeName: 'Office of the BL&LRO, Mandirbazar' },
      { name: 'Mathurapur-I', bnName: 'মথুরাপুর-১', code: '1619', officeName: 'Office of the BL&LRO, Mathurapur-I' },
      { name: 'Mathurapur-II', bnName: 'মথুরাপুর-২', code: '1620', officeName: 'Office of the BL&LRO, Mathurapur-II' },
      { name: 'Kakdwip', bnName: 'কাকদ্বীপ', code: '1621', officeName: 'Office of the BL&LRO, Kakdwip' },
      { name: 'Namkhana', bnName: 'নামখানা', code: '1622', officeName: 'Office of the BL&LRO, Namkhana' },
      { name: 'Sagar', bnName: 'সাগর', code: '1623', officeName: 'Office of the BL&LRO, Sagar' },
      { name: 'Patharpratima', bnName: 'পাথরপ্রতিমা', code: '1624', officeName: 'Office of the BL&LRO, Patharpratima' },
      { name: 'Budge Budge-I', bnName: 'বজবজ-১', code: '1625', officeName: 'Office of the BL&LRO, Budge Budge-I' },
      { name: 'Budge Budge-II', bnName: 'বজবজ-২', code: '1626', officeName: 'Office of the BL&LRO, Budge Budge-II' },
      { name: 'Bishnupur-I', bnName: 'বিষ্ণুপুর-১', code: '1627', officeName: 'Office of the BL&LRO, Bishnupur-I' },
      { name: 'Bishnupur-II', bnName: 'বিষ্ণুপুর-২', code: '1628', officeName: 'Office of the BL&LRO, Bishnupur-II' },
      { name: 'Thakurpukur Maheshtala', bnName: 'ঠাকুরপুকুর মহেশতলা', code: '1629', officeName: 'Office of the BL&LRO, Thakurpukur Maheshtala' },
    ],
  },
  {
    id: 'n24p',
    name: 'North 24 Parganas',
    bnName: 'উত্তর ২৪ পরগণা',
    distCode: '15',
    blocks: [
      { name: 'Barasat-I', bnName: 'বারাসাত-১', code: '1501', officeName: 'Office of the BL&LRO, Barasat-I' },
      { name: 'Barasat-II', bnName: 'বারাসাত-২', code: '1502', officeName: 'Office of the BL&LRO, Barasat-II' },
      { name: 'Rajarhat', bnName: 'রাজারহাট', code: '1503', officeName: 'Office of the BL&LRO, Rajarhat' },
      { name: 'Deganga', bnName: 'দেগঙ্গা', code: '1504', officeName: 'Office of the BL&LRO, Deganga' },
      { name: 'Habra-I', bnName: 'হাবড়া-১', code: '1505', officeName: 'Office of the BL&LRO, Habra-I' },
      { name: 'Habra-II', bnName: 'হাবড়া-২', code: '1506', officeName: 'Office of the BL&LRO, Habra-II' },
      { name: 'Amdanga', bnName: 'আমডাঙা', code: '1507', officeName: 'Office of the BL&LRO, Amdanga' },
      { name: 'Bongaon', bnName: 'বনগাঁ', code: '1508', officeName: 'Office of the BL&LRO, Bongaon' },
      { name: 'Gaighata', bnName: 'গাইঘাটা', code: '1509', officeName: 'Office of the BL&LRO, Gaighata' },
      { name: 'Bagdah', bnName: 'বাগদা', code: '1510', officeName: 'Office of the BL&LRO, Bagdah' },
      { name: 'Basirhat-I', bnName: 'বসিরহাট-১', code: '1511', officeName: 'Office of the BL&LRO, Basirhat-I' },
      { name: 'Basirhat-II', bnName: 'বসিরহাট-২', code: '1512', officeName: 'Office of the BL&LRO, Basirhat-II' },
      { name: 'Baduria', bnName: 'বাদুড়িয়া', code: '1513', officeName: 'Office of the BL&LRO, Baduria' },
      { name: 'Haroa', bnName: 'হাড়োয়া', code: '1514', officeName: 'Office of the BL&LRO, Haroa' },
      { name: 'Minakhan', bnName: 'মিনাখাঁ', code: '1515', officeName: 'Office of the BL&LRO, Minakhan' },
      { name: 'Sandeshkhali-I', bnName: 'সন্দেশখালি-১', code: '1516', officeName: 'Office of the BL&LRO, Sandeshkhali-I' },
      { name: 'Sandeshkhali-II', bnName: 'সন্দেশখালি-২', code: '1517', officeName: 'Office of the BL&LRO, Sandeshkhali-II' },
      { name: 'Hasnabad', bnName: 'হাসনাবাদ', code: '1518', officeName: 'Office of the BL&LRO, Hasnabad' },
      { name: 'Hingalganj', bnName: 'হিঙ্গলগঞ্জ', code: '1519', officeName: 'Office of the BL&LRO, Hingalganj' },
      { name: 'Barrackpore-I', bnName: 'ব্যারাকপুর-১', code: '1520', officeName: 'Office of the BL&LRO, Barrackpore-I' },
      { name: 'Barrackpore-II', bnName: 'ব্যারাকপুর-২', code: '1521', officeName: 'Office of the BL&LRO, Barrackpore-II' },
    ],
  },
  {
    id: 'howrah',
    name: 'Howrah',
    bnName: 'হাওড়া',
    distCode: '17',
    blocks: [
      { name: 'Uluberia-I', bnName: 'উলুবেড়িয়া-১', code: '1701', officeName: 'Office of the BL&LRO, Uluberia-I' },
      { name: 'Uluberia-II', bnName: 'উলুবেড়িয়া-২', code: '1702', officeName: 'Office of the BL&LRO, Uluberia-II' },
      { name: 'Domjur', bnName: 'ডোমজুড়', code: '1703', officeName: 'Office of the BL&LRO, Domjur' },
      { name: 'Sankrail', bnName: 'সাঁকরাইল', code: '1704', officeName: 'Office of the BL&LRO, Sankrail' },
      { name: 'Panchla', bnName: 'পাঁচলা', code: '1705', officeName: 'Office of the BL&LRO, Panchla' },
      { name: 'Jagatballavpur', bnName: 'জগতবল্লভপুর', code: '1706', officeName: 'Office of the BL&LRO, Jagatballavpur' },
      { name: 'Bally Jagachha', bnName: 'বালি জগাছা', code: '1707', officeName: 'Office of the BL&LRO, Bally Jagachha' },
      { name: 'Amta-I', bnName: 'আমতা-১', code: '1708', officeName: 'Office of the BL&LRO, Amta-I' },
      { name: 'Amta-II', bnName: 'আমতা-২', code: '1709', officeName: 'Office of the BL&LRO, Amta-II' },
      { name: 'Bagnan-I', bnName: 'বাগনান-১', code: '1710', officeName: 'Office of the BL&LRO, Bagnan-I' },
      { name: 'Bagnan-II', bnName: 'বাগনান-২', code: '1711', officeName: 'Office of the BL&LRO, Bagnan-II' },
      { name: 'Udaynarayanpur', bnName: 'উদয়নারায়ণপুর', code: '1712', officeName: 'Office of the BL&LRO, Udaynarayanpur' },
      { name: 'Shyampur-I', bnName: 'শ্যামপুর-১', code: '1713', officeName: 'Office of the BL&LRO, Shyampur-I' },
      { name: 'Shyampur-II', bnName: 'শ্যামপুর-২', code: '1714', officeName: 'Office of the BL&LRO, Shyampur-II' },
    ],
  },
  {
    id: 'hooghly',
    name: 'Hooghly',
    bnName: 'হুগলী',
    distCode: '12',
    blocks: [
      { name: 'Chinsurah-Mogra', bnName: 'চুঁচুড়া-মগরা', code: '1201', officeName: 'Office of the BL&LRO, Chinsurah-Mogra' },
      { name: 'Polba-Dadpur', bnName: 'পোলবা-দাদপুর', code: '1202', officeName: 'Office of the BL&LRO, Polba-Dadpur' },
      { name: 'Balagarh', bnName: 'বলা Polba-Dadpurগড়', code: '1203', officeName: 'Office of the BL&LRO, Balagarh' },
      { name: 'Pandua', bnName: 'পান্ডুয়া', code: '1204', officeName: 'Office of the BL&LRO, Pandua' },
      { name: 'Dhaniakhali', bnName: 'ধনিয়াখালি', code: '1205', officeName: 'Office of the BL&LRO, Dhaniakhali' },
      { name: 'Tarakeswar', bnName: 'তারকেশ্বর', code: '1206', officeName: 'Office of the BL&LRO, Tarakeswar' },
      { name: 'Haripal', bnName: 'হরিপাল', code: '1207', officeName: 'Office of the BL&LRO, Haripal' },
      { name: 'Singur', bnName: 'সিঙ্গুর', code: '1208', officeName: 'Office of the BL&LRO, Singur' },
      { name: 'Chanditala-I', bnName: 'চণ্ডীতলা-১', code: '1209', officeName: 'Office of the BL&LRO, Chanditala-I' },
      { name: 'Chanditala-II', bnName: 'চণ্ডীতলা-২', code: '1210', officeName: 'Office of the BL&LRO, Chanditala-II' },
      { name: 'Jangipara', bnName: 'জঙ্গিপাড়া', code: '1211', officeName: 'Office of the BL&LRO, Jangipara' },
      { name: 'Serampore-Uttarpara', bnName: 'শ্রীরামপুর-উত্তরপাড়া', code: '1212', officeName: 'Office of the BL&LRO, Serampore-Uttarpara' },
      { name: 'Arambagh', bnName: 'আরামবাগ', code: '1213', officeName: 'Office of the BL&LRO, Arambagh' },
      { name: 'Khanakul-I', bnName: 'খানাকুল-১', code: '1214', officeName: 'Office of the BL&LRO, Khanakul-I' },
      { name: 'Khanakul-II', bnName: 'খানাকুল-২', code: '1215', officeName: 'Office of the BL&LRO, Khanakul-II' },
      { name: 'Pursurah', bnName: 'পুরশুড়া', code: '1216', officeName: 'Office of the BL&LRO, Pursurah' },
      { name: 'Goghat-I', bnName: 'গোঘাট-১', code: '1217', officeName: 'Office of the BL&LRO, Goghat-I' },
      { name: 'Goghat-II', bnName: 'গোঘাট-২', code: '1218', officeName: 'Office of the BL&LRO, Goghat-II' },
    ],
  },
  {
    id: 'nadia',
    name: 'Nadia',
    bnName: 'নদিয়া',
    distCode: '13',
    blocks: [
      { name: 'Krishnanagar-I', bnName: 'কৃষ্ণনগর-১', code: '1301', officeName: 'Office of the BL&LRO, Krishnanagar-I' },
      { name: 'Krishnanagar-II', bnName: 'কৃষ্ণনগর-২', code: '1302', officeName: 'Office of the BL&LRO, Krishnanagar-II' },
      { name: 'Nabadwip', bnName: 'নবদ্বীপ', code: '1303', officeName: 'Office of the BL&LRO, Nabadwip' },
      { name: 'Chapra', bnName: 'চাপড়া', code: '1304', officeName: 'Office of the BL&LRO, Chapra' },
      { name: 'Nakashipara', bnName: 'নাকাশিপাড়া', code: '1305', officeName: 'Office of the BL&LRO, Nakashipara' },
      { name: 'Kaliganj', bnName: 'কালীগঞ্জ', code: '1306', officeName: 'Office of the BL&LRO, Kaliganj' },
      { name: 'Santipur', bnName: 'শান্তিপুর', code: '1313', officeName: 'Office of the BL&LRO, Santipur' },
      { name: 'Ranaghat-I', bnName: 'রানাঘাট-১', code: '1311', officeName: 'Office of the BL&LRO, Ranaghat-I' },
      { name: 'Ranaghat-II', bnName: 'রানাঘাট-২', code: '1312', officeName: 'Office of the BL&LRO, Ranaghat-II' },
      { name: 'Chakdaha', bnName: 'চাকদহ', code: '1315', officeName: 'Office of the BL&LRO, Chakdaha' },
      { name: 'Haringhata', bnName: 'হরিণঘাটা', code: '1316', officeName: 'Office of the BL&LRO, Haringhata' },
      { name: 'Tehatta-I', bnName: 'তেহট্ট-১', code: '1307', officeName: 'Office of the BL&LRO, Tehatta-I' },
      { name: 'Tehatta-II', bnName: 'তেহট্ট-২', code: '1308', officeName: 'Office of the BL&LRO, Tehatta-II' },
      { name: 'Karimpur-I', bnName: 'করিমপুর-১', code: '1309', officeName: 'Office of the BL&LRO, Karimpur-I' },
      { name: 'Karimpur-II', bnName: 'করিমপুর-২', code: '1310', officeName: 'Office of the BL&LRO, Karimpur-II' },
    ],
  },
  {
    id: 'purba_bardhaman',
    name: 'Purba Bardhaman',
    bnName: 'পূর্ব বর্ধমান',
    distCode: '19',
    blocks: [
      { name: 'Burdwan-I', bnName: 'বর্ধমান-১', code: '1901', officeName: 'Office of the BL&LRO, Burdwan-I' },
      { name: 'Burdwan-II', bnName: 'বর্ধমান-২', code: '1902', officeName: 'Office of the BL&LRO, Burdwan-II' },
      { name: 'Bhatar', bnName: 'ভাতাড়', code: '1903', officeName: 'Office of the BL&LRO, Bhatar' },
      { name: 'Galsi-I', bnName: 'গলসি-১', code: '1904', officeName: 'Office of the BL&LRO, Galsi-I' },
      { name: 'Galsi-II', bnName: 'গলসি-২', code: '1905', officeName: 'Office of the BL&LRO, Galsi-II' },
      { name: 'Kalna-I', bnName: 'কালনা-১', code: '1911', officeName: 'Office of the BL&LRO, Kalna-I' },
      { name: 'Kalna-II', bnName: 'কালনা-২', code: '1912', officeName: 'Office of the BL&LRO, Kalna-II' },
      { name: 'Katwa-I', bnName: 'কাটোয়া-১', code: '1913', officeName: 'Office of the BL&LRO, Katwa-I' },
      { name: 'Katwa-II', bnName: 'কাটোয়া-২', code: '1914', officeName: 'Office of the BL&LRO, Katwa-II' },
      { name: 'Memari-I', bnName: 'মেমারি-১', code: '1908', officeName: 'Office of the BL&LRO, Memari-I' },
      { name: 'Memari-II', bnName: 'মেমারি-২', code: '1909', officeName: 'Office of the BL&LRO, Memari-II' },
    ],
  },
  {
    id: 'paschim_bardhaman',
    name: 'Paschim Bardhaman',
    bnName: 'পশ্চিম বর্ধমান',
    distCode: '20',
    blocks: [
      { name: 'Asansol', bnName: 'আসানসোল', code: '2001', officeName: 'Office of the BL&LRO, Asansol' },
      { name: 'Durgapur-Faridpur', bnName: 'দুর্গাপুর-ফরিদপুর', code: '2002', officeName: 'Office of the BL&LRO, Durgapur-Faridpur' },
      { name: 'Andal', bnName: 'অন্ডাল', code: '2003', officeName: 'Office of the BL&LRO, Andal' },
      { name: 'Raniganj', bnName: 'রাণীগঞ্জ', code: '2005', officeName: 'Office of the BL&LRO, Raniganj' },
      { name: 'Kanksa', bnName: 'কাঁকসা', code: '2008', officeName: 'Office of the BL&LRO, Kanksa' },
    ],
  },
  {
    id: 'purba_medinipur',
    name: 'Purba Medinipur',
    bnName: 'পূর্ব মেদিনীপুর',
    distCode: '14',
    blocks: [
      { name: 'Tamluk', bnName: 'তমলুক', code: '1401', officeName: 'Office of the BL&LRO, Tamluk' },
      { name: 'Sahid Matangini', bnName: 'শহীদ মাতঙ্গিনী', code: '1402', officeName: 'Office of the BL&LRO, Sahid Matangini' },
      { name: 'Panskura', bnName: 'পাঁশকুড়া', code: '1403', officeName: 'Office of the BL&LRO, Panskura' },
      { name: 'Kolaghat', bnName: 'কোলাঘাট', code: '1404', officeName: 'Office of the BL&LRO, Kolaghat' },
      { name: 'Nandigram-I', bnName: 'নন্দীগ্রাম-১', code: '1409', officeName: 'Office of the BL&LRO, Nandigram-I' },
      { name: 'Nandigram-II', bnName: 'নন্দীগ্রাম-২', code: '1410', officeName: 'Office of the BL&LRO, Nandigram-II' },
      { name: 'Haldia', bnName: 'হলদিয়া', code: '1412', officeName: 'Office of the BL&LRO, Haldia' },
      { name: 'Contai-I', bnName: 'কাঁথি-১', code: '1413', officeName: 'Office of the BL&LRO, Contai-I' },
      { name: 'Contai-II', bnName: 'কাঁথি-২', code: '1414', officeName: 'Office of the BL&LRO, Contai-II' },
      { name: 'Egra-I', bnName: 'এগরা-১', code: '1420', officeName: 'Office of the BL&LRO, Egra-I' },
      { name: 'Egra-II', bnName: 'এগরা-২', code: '1421', officeName: 'Office of the BL&LRO, Egra-II' },
    ],
  },
  {
    id: 'paschim_medinipur',
    name: 'Paschim Medinipur',
    bnName: 'পশ্চিম মেদিনীপুর',
    distCode: '18',
    blocks: [
      { name: 'Midnapore Sadar', bnName: 'মেদিনীপুর সদর', code: '1801', officeName: 'Office of the BL&LRO, Midnapore Sadar' },
      { name: 'Kharagpur-I', bnName: 'খড়গপুর-১', code: '1802', officeName: 'Office of the BL&LRO, Kharagpur-I' },
      { name: 'Kharagpur-II', bnName: 'খড়গপুর-২', code: '1803', officeName: 'Office of the BL&LRO, Kharagpur-II' },
      { name: 'Debra', bnName: 'ডেবরা', code: '1804', officeName: 'Office of the BL&LRO, Debra' },
      { name: 'Ghatal', bnName: 'ঘাটাল', code: '1819', officeName: 'Office of the BL&LRO, Ghatal' },
      { name: 'Daspur-I', bnName: 'দাসপুর-১', code: '1820', officeName: 'Office of the BL&LRO, Daspur-I' },
      { name: 'Daspur-II', bnName: 'দাসপুর-২', code: '1821', officeName: 'Office of the BL&LRO, Daspur-II' },
    ],
  },
  {
    id: 'murshidabad',
    name: 'Murshidabad',
    bnName: 'মুর্শিদাবাদ',
    distCode: '11',
    blocks: [
      { name: 'Berhampore', bnName: 'বহরমপুর', code: '1101', officeName: 'Office of the BL&LRO, Berhampore' },
      { name: 'Beldanga-I', bnName: 'বেলডাঙা-১', code: '1102', officeName: 'Office of the BL&LRO, Beldanga-I' },
      { name: 'Beldanga-II', bnName: 'বেলডাঙা-২', code: '1103', officeName: 'Office of the BL&LRO, Beldanga-II' },
      { name: 'Kandi', bnName: 'কান্দি', code: '1106', officeName: 'Office of the BL&LRO, Kandi' },
      { name: 'Lalbagh', bnName: 'লালবাগ', code: '1111', officeName: 'Office of the BL&LRO, Lalbagh' },
      { name: 'Jangipur', bnName: 'জঙ্গিপুর', code: '1116', officeName: 'Office of the BL&LRO, Jangipur' },
      { name: 'Domkal', bnName: 'ডোমকল', code: '1122', officeName: 'Office of the BL&LRO, Domkal' },
    ],
  },
  {
    id: 'birbhum',
    name: 'Birbhum',
    bnName: 'বীরভূম',
    distCode: '08',
    blocks: [
      { name: 'Suri-I', bnName: 'সিউড়ী-১', code: '0801', officeName: 'Office of the BL&LRO, Suri-I' },
      { name: 'Suri-II', bnName: 'সিউড়ী-২', code: '0802', officeName: 'Office of the BL&LRO, Suri-II' },
      { name: 'Bolpur-Sriniketan', bnName: 'বোলপুর-শ্রীনিকেতন', code: '0804', officeName: 'Office of the BL&LRO, Bolpur-Sriniketan' },
      { name: 'Rampurhat-I', bnName: 'রামপুরহাট-১', code: '0811', officeName: 'Office of the BL&LRO, Rampurhat-I' },
      { name: 'Rampurhat-II', bnName: 'রামপুরহাট-২', code: '0812', officeName: 'Office of the BL&LRO, Rampurhat-II' },
    ],
  },
  {
    id: 'bankura',
    name: 'Bankura',
    bnName: 'বাঁকুড়া',
    distCode: '10',
    blocks: [
      { name: 'Bankura-I', bnName: 'বাঁকুড়া-১', code: '1001', officeName: 'Office of the BL&LRO, Bankura-I' },
      { name: 'Bankura-II', bnName: 'বাঁকুড়া-২', code: '1002', officeName: 'Office of the BL&LRO, Bankura-II' },
      { name: 'Bishnupur', bnName: 'বিষ্ণুপুর', code: '1009', officeName: 'Office of the BL&LRO, Bishnupur' },
      { name: 'Khatra', bnName: 'খাতড়া', code: '1015', officeName: 'Office of the BL&LRO, Khatra' },
    ],
  },
  {
    id: 'malda',
    name: 'Malda',
    bnName: 'মালদা',
    distCode: '06',
    blocks: [
      { name: 'English Bazar', bnName: 'ইংলিশ বাজার', code: '0601', officeName: 'Office of the BL&LRO, English Bazar' },
      { name: 'Old Malda', bnName: 'পুরাতন মালদা', code: '0602', officeName: 'Office of the BL&LRO, Old Malda' },
      { name: 'Chanchal-I', bnName: 'চাঁচল-১', code: '0612', officeName: 'Office of the BL&LRO, Chanchal-I' },
    ],
  },
  {
    id: 'purulia',
    name: 'Purulia',
    bnName: 'পুরুলিয়া',
    distCode: '09',
    blocks: [
      { name: 'Purulia-I', bnName: 'পুরুলিয়া-১', code: '0901', officeName: 'Office of the BL&LRO, Purulia-I' },
      { name: 'Raghunathpur-I', bnName: 'রঘুনাথপুর-১', code: '0916', officeName: 'Office of the BL&LRO, Raghunathpur-I' },
    ],
  },
  {
    id: 'jalpaiguri',
    name: 'Jalpaiguri',
    bnName: 'জলপাইগুড়ি',
    distCode: '02',
    blocks: [
      { name: 'Jalpaiguri Sadar', bnName: 'জলপাইগুড়ি সদর', code: '0201', officeName: 'Office of the BL&LRO, Jalpaiguri Sadar' },
      { name: 'Malbazar', bnName: 'মালবাজার', code: '0204', officeName: 'Office of the BL&LRO, Malbazar' },
    ],
  },
  {
    id: 'cooch_behar',
    name: 'Cooch Behar',
    bnName: 'কোচবিহার',
    distCode: '03',
    blocks: [
      { name: 'Cooch Behar-I', bnName: 'কোচবিহার-১', code: '0301', officeName: 'Office of the BL&LRO, Cooch Behar-I' },
      { name: 'Dinhata-I', bnName: 'দিনহাটা-১', code: '0303', officeName: 'Office of the BL&LRO, Dinhata-I' },
    ],
  },
];

/**
 * Generate standard Mutation Application Number
 * Format: MUTE/<YEAR>/<BLLRO_CODE>/<SERIAL>
 */
export function generateMutationAppNo(
  year: string | number = new Date().getFullYear(),
  bllroCode: string = '1603',
  serial?: string | number
): string {
  const cleanYear = year || new Date().getFullYear();
  const cleanCode = bllroCode || '1603';
  const seq = serial ? String(serial).padStart(4, '0') : String(Math.floor(1000 + Math.random() * 9000));
  return `MUTE/${cleanYear}/${cleanCode}/${seq}`;
}
