import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'https://api-dev/article/list',
    method: 'get',
    params: query
  })
}