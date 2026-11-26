"""Offline unit tests for scripts/refresh_catalog.py. Run: python3 -m unittest scripts/test_refresh_catalog.py"""
import pathlib, sys, unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import refresh_catalog as rc  # noqa: E402

S = rc.STORAGE


class FolderYear(unittest.TestCase):
    def test_two_year_folder(self):
        self.assertEqual(rc.folder_year(S + '2026_2027/Primary/Primary5/Term1/StudentBook/x.pdf'), ('2026_2027', '2026/2027', 2026))

    def test_single_year_folder_is_the_year_ending(self):
        self.assertEqual(rc.folder_year(S + '2026/Primary/Primary5/Term1/StudentBook/x.pdf'), ('2026', '2025/2026', 2025))

    def test_unknown_folder(self):
        self.assertEqual(rc.folder_year('https://example.com/a.pdf'), ('', None, None))


class ParseLink(unittest.TestCase):
    def test_primary_arabic(self):
        p = rc.parse_link(S + '2026_2027/Primary/Primary5/Term1/StudentBook/Arabic_langugae_prim5_t1.pdf')
        self.assertEqual((p['grade'], p['term'], p['kind'], p['subject'], p['lang']), (5, 1, 'StudentBook', 'arabic', 'ar'))

    def test_preparatory_grade_offset(self):
        self.assertEqual(rc.parse_link(S + '2026/Prepratory/Prepratory2/Term2/StudentBook/Social_prp2_T2.pdf')['grade'], 8)

    def test_discover_editions_by_language(self):
        base = S + '2026/Primary/Primary2/Term2/StudentBook/'
        self.assertEqual(rc.parse_link(base + 'Discovery_AR_prim2_TR1_2.pdf')['lang'], 'ar')
        self.assertEqual(rc.parse_link(base + 'Discovery_E_prim2_TR1_2.pdf')['lang'], 'en')
        self.assertEqual(rc.parse_link(base + 'Discovery_F_Prim2_TR1_2.pdf')['lang'], 'fr')

    def test_math_in_arabic_is_math_not_arabic(self):
        self.assertEqual(rc.parse_link(S + '2026/Primary/Primary6/Term1/StudentBook/Math_Ar_prim6_TR1.pdf')['subject'], 'math')

    def test_religion_spellings(self):
        self.assertEqual(rc.parse_link(S + '2026_2027/Primary/Primary3/Term1/StudentBook/Cristian_religion_prim3_t1.pdf')['subject'], 'religion-christian')
        self.assertEqual(rc.parse_link(S + '2026/Primary/Primary5/Term2/StudentBook/CH_Prim5_T2.pdf')['subject'], 'religion-christian')
        self.assertEqual(rc.parse_link(S + '2026/Primary/Primary5/Term2/StudentBook/Islamic_prim5_Tr2.pdf')['subject'], 'religion-islamic')


class Text(unittest.TestCase):
    def test_normalisation_removes_diacritics_digits_and_unifies_letters(self):
        self.assertEqual(rc.norm_words('الدَّرْسُ الأوَّل ١٢ مُرَاجَعَةٌ'), ['الدرس', 'الاول', 'مراجعه'])

    def test_classify_thresholds(self):
        self.assertEqual(rc.classify(0.92), 'same')
        self.assertEqual(rc.classify(0.48), 'changed')
        self.assertEqual(rc.classify(0.70), 'review')
        self.assertEqual(rc.classify(None), 'review')


class Candidates(unittest.TestCase):
    syl = dict(subject='social-studies', grade_min=5, term=1, academic_year='2025/2026',
               source_url=S + '2026/Primary/Primary5/Term1/StudentBook/Social_prim5_T1.pdf')

    def row(self, path, status='ok'):
        return dict(url=S + path, status=status)

    def test_newer_matching_edition_is_found(self):
        rows = [self.row('2026_2027/Primary/Primary5/Term1/StudentBook/Social_studies_prim5_t1.pdf')]
        self.assertEqual(len(rc.candidates_for(self.syl, rows)), 1)

    def test_wrong_grade_term_subject_or_older_year_is_ignored(self):
        rows = [self.row('2026_2027/Primary/Primary4/Term1/StudentBook/Social_studies_prim4_t1.pdf'),
                self.row('2026_2027/Primary/Primary5/Term2/StudentBook/Social_studies_prim5_t2.pdf'),
                self.row('2026_2027/Primary/Primary5/Term1/StudentBook/Arabic_langugae_prim5_t1.pdf'),
                self.row('content/2024/Primary/Primary5/Term1/StudentBook/Social_prim5.pdf'),
                self.row('2026_2027/Primary/Primary5/Term1/ClassrHomeAssessmentsTest/Social_prim5_w1.pdf'),
                self.row('2026_2027/Primary/Primary5/Term1/StudentBook/Social_studies_prim5_t1_dead.pdf', status='http 404')]
        self.assertEqual(rc.candidates_for(self.syl, rows), [])

    def test_english_edition_is_not_a_candidate_for_an_arabic_book(self):
        syl = dict(subject='discover', grade_min=2, term=None, academic_year='2025/2026',
                   source_url=S + '2026/Primary/Primary2/Term2/StudentBook/Discovery_AR_prim2_TR1_2.pdf')
        rows = [self.row('2026_2027/Primary/Primary2/Term1/StudentBook/Discovery_E_prim2_TR1.pdf'),
                self.row('2026_2027/Primary/Primary2/Term1/StudentBook/Discovery_AR_prim2_TR1.pdf')]
        self.assertEqual([u.rsplit('/', 1)[-1] for u in rc.candidates_for(syl, rows)], ['Discovery_AR_prim2_TR1.pdf'])


class Registry(unittest.TestCase):
    def test_sorting_mixes_csv_strings_and_new_int_rows(self):
        rows = [dict(grade='5', term='1', subject_guess='arabic', folder_year='2026', file='a.pdf'),
                rc.registry_row(S + '2026_2027/Primary/Primary4/Term1/StudentBook/Social_studies_prim4_t1.pdf', 'ok', 'test'),
                dict(grade='', term='', subject_guess='other', folder_year='', file='z.pdf')]
        rows.sort(key=rc.registry_sort_key)  # regression: this used to raise TypeError
        self.assertEqual([str(r['grade']) for r in rows], ['4', '5', ''])


if __name__ == '__main__':
    unittest.main()
