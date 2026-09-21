import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qejnbyywetjbemevujsj.supabase.co'
const supabaseAnonKey = 'sb_publishable_HoP51uLLbXXeoqdcmsJzQw_Zhplm1Ex'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
