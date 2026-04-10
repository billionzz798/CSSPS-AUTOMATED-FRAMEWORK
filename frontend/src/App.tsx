import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Simulation from './pages/Simulation'
import Result from './pages/Result'
import LoadTest from './pages/LoadTest'
import Compare from './pages/Compare'
import ComparisonResults from './pages/ComparisonResults'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/result/:jobId" element={<Result />} />
        <Route path="/load-test" element={<LoadTest />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/comparison/:jobId" element={<ComparisonResults />} />
      </Routes>
    </Layout>
  )
}
